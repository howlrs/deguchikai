use log::{error, info};
use serde_json::Value;

mod slide;

use std::io::Write;

use crate::slide::{section::Section, utils, video};

// 動画出力のためのリソースファイルを生成します。
#[tauri::command]
fn initialize() -> Result<String, String> {
    // project root directory
    let text_filename = utils::target_path_from_env("DEFAULT_RESOURCE_FILE_PATH");
    // create blanc file
    let mut file = std::fs::File::create(&text_filename).map_err(|x| x.to_string())?;
    file.write_all("".as_bytes()).map_err(|x| x.to_string())?;
    file.flush().map_err(|x| x.to_string())?;
    let result = format!("create blank file: {:?}", text_filename);

    Ok(result.to_string())
}

#[tauri::command]
fn generate(data: Value) -> Result<String, String> {
    let text_filename = utils::target_path_from_env("DEFAULT_RESOURCE_FILE_PATH");

    // 下記形式でJSONファイルをテキストファイルに変換し保存する
    // [filename]
    // # title
    // @voice_id text
    {
        let format_str = value_to_resource(data);
        let mut file = std::fs::OpenOptions::new()
            .write(true)
            .truncate(true)
            .open(&text_filename)
            .map_err(|x| x.to_string())?;
        file.write_all(format_str.as_bytes())
            .map_err(|x| x.to_string())?;
        file.flush().map_err(|x| x.to_string())?;
    }

    // テキストファイルを読み込み、セクションデータを取得する
    let sections = slide::section::Section::create_vec(text_filename).unwrap();
    info!("resource data for section: {:?}", sections);

    // 動画を生成
    let result = match tauri::async_runtime::block_on(generate_video(sections)) {
        Ok(output_file) => {
            info!("video output: {:?}", output_file);
            output_file
        }
        Err(e) => {
            error!("failed to generate video: {}", e);
            return Err(e);
        }
    };

    Ok(format!("success: output to {}", result).to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv::dotenv().ok();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![initialize, generate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn value_to_resource(value: Value) -> String {
    let mut format_str = String::new();

    // 下記形式でJSONファイルをテキストファイルに変換し保存する
    // [filename]
    // # title
    // @voice_id text
    for slide in value.as_array().unwrap() {
        let filename = slide["filename"].as_str().unwrap();
        let title = slide["title"].as_str().unwrap_or_default();
        format_str.push_str(&format!("[{}]\n", filename));
        if !title.is_empty() {
            format_str.push_str(&format!("# {}\n", title));
        }

        let contents = match slide["contents"].as_array() {
            Some(contents) => contents,
            None => continue,
        };

        for content in contents {
            let row = match content["voice_id"].as_number() {
                Some(voice_id) => format!("@{} ", voice_id),
                None => String::new(),
            };

            match content["text"].as_str() {
                Some(text) => format_str.push_str(&format!("{}{}\n", row, text)),
                None => continue,
            };
        }
    }

    format_str.trim().to_string()
}

async fn generate_video(mut sections: Vec<Section>) -> Result<String, String> {
    // セクションのテキストを音声に変換
    // sections.voicesにはコンテンツkey対応の音声ファイルが格納される
    for section in sections.iter_mut() {
        // 画像及び動画一つに対して、複数の音声が出力される
        // 段落ごとに音声を生成
        match section.create_voices().await {
            Ok(_) => {
                info!("to_voices: {:?}", section);
            }
            Err(e) => {
                error!("failed to_voices error: {}", e);
                return Err(e);
            }
        };

        // 段落ごとに動画を生成
        // - テキスト・音声ファイル群を画像に焼き付け
        // - セッションVideoに動画ファイルパスを格納
        match section.create_video().await {
            Ok(_) => {
                info!("inner create_video: {:?}", section);
            }
            Err(e) => {
                error!("failed create_video error: {}", e);
                return Err(e);
            }
        };
    }

    // Videoのパスを出力
    let concated_videos = sections
        .iter()
        .filter_map(|section| section.video.clone())
        .collect::<Vec<String>>();

    // 動画連結のためのファイルを作成
    // 出力先ファイルを作成
    let (concat_file, output_file) = video::create_output_files(concated_videos);

    // 動画を連結
    match video::concat(concat_file, output_file.clone()).await {
        Ok(output_video_filepath) => {
            info!("last video concated: {:?}", output_video_filepath);
        }
        Err(e) => {
            error!("last concat Error: {}", e);
            return Err(e);
        }
    };

    Ok(output_file)
}
