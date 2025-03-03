import { useState } from "react";
import { FloatButton } from "antd";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { defaultFilename, SlideComponent, SlideValue } from "./components/update-slide";
import { v4 as uuidv4 } from "uuid";

import { FileOutlined, PlayCircleTwoTone } from "@ant-design/icons";

interface SectionValue {
  filename: string;
  title: string;
  contents: Content[];
}

interface Content {
  key: string;
  voice_id: number;
  text: string;
}

const comvertToSection = (slides: SlideValue[]): SectionValue[] => {
  return slides.map((slide) => {
    return {
      filename: slide.filename,
      title: slide.title || "",
      contents: slide.rows.map((row) => {
        return {
          key: row.key,
          voice_id: row.voiceId,
          text: row.content
        }
      })
    }
  });
};

const App = () => {
  const [result, setResult] = useState("");
  const [slides, setSlides] = useState<SlideValue[]>([{
    key: uuidv4(),
    filename: defaultFilename,
    rows: [
      { key: uuidv4(), voiceId: 0, content: 'content' }
    ]
  }] as SlideValue[]);

  const onInitialize = async () => {
    setResult(await invoke("initialize", {}));
  }

  const onGenerate = async () => {
    try {
      const sections = comvertToSection(slides);
      console.log(sections);

      const res = await invoke("generate", { data: sections });
      console.log(res);

      setResult(res as string);
    } catch (e) {
      console.error(e);
    }
  }

  const onUpdate = (value: SlideValue[]) => {
    setSlides(value);
  };


  return (
    <main className="container">
      <p>{result}</p>

      <SlideComponent slides={slides} onUpdate={onUpdate} />

      <FloatButton icon={<FileOutlined />} type="default" onClick={onInitialize} style={{ insetInlineEnd: 94 }} />
      <FloatButton icon={<PlayCircleTwoTone />} type="default" onClick={onGenerate} style={{ insetInlineEnd: 24 }} />


    </main>
  );
}

export default App;
