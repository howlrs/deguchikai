import { useState, useEffect, useMemo } from "react";
import { RowsComponent, RowValue } from "./update-rows";
import { Image, Button, Col, Input, message, Row, Space } from "antd";
import { v4 as uuidv4 } from "uuid";
import { convertFileSrc } from '@tauri-apps/api/core'; // Tauri v2では core からインポート

export const defaultFilename = 'target filename(absolute path)';

interface UpdateProps {
    slides: SlideValue[];
    onUpdate: (value: SlideValue[]) => void;
};

export interface SlideValue {
    key: string;
    filename: string;
    title?: string;
    rows: RowValue[];
}

export const SlideComponent = ({ slides, onUpdate }: UpdateProps) => {
    const [state, setState] = useState<SlideValue[]>(slides);

    const onChangeFilename = (index: number, target: string) => {
        setState((prev) => {
            const newState = [...prev];
            if (index >= newState.length) {
                return newState;
            }
            newState[index] = { ...prev[index], filename: target };
            onUpdate(newState);
            return newState;
        });
    };

    const onChangeTitle = (index: number, target: string) => {
        setState((prev) => {
            const newState = [...prev];
            if (index >= newState.length) {
                return newState;
            }
            newState[index] = { ...prev[index], title: target };
            onUpdate(newState);
            return newState;
        });
    };

    const onChildUpdate = (index: number, rows: RowValue[]) => {
        // 指定配列の要素を更新
        setState((prev) => {
            if (index >= prev.length) {
                return prev;
            }
            const newState = [...prev];
            newState[index] = { ...prev[index], rows };
            onUpdate(newState);
            return newState;
        });
    };

    const deleteSlide = (key: string) => {
        if (state.length <= 1) {
            message.open({
                type: 'warning',
                content: '最小配列です。',
                duration: 3
            });
            return;
        }

        setState((prev) => {
            const updateSlides = prev.filter((slide) => slide.key !== key);
            // 親コンポーネントの状態も更新
            onUpdate(updateSlides);
            return updateSlides;
        });
    }

    const onAddSlide = () => {
        setState((prev) => {
            const key = uuidv4();
            const rowKey = uuidv4();
            const newSlide = { key: key, filename: '', rows: [{ key: rowKey, voiceId: 0, content: '' }] };
            const newState = [...prev, newSlide];
            onUpdate(newState);
            return newState;
        });
    };

    // 既存のステート定義...
    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

    // slideが変更されたときにURLを一度だけ変換
    useEffect(() => {
        const updateImageUrls = async () => {
            const newImageUrls: Record<string, string> = {};

            for (const slide of state) {
                if (slide.filename && slide.filename !== defaultFilename) {
                    try {
                        const url = convertFileSrc(slide.filename);
                        newImageUrls[slide.key] = url;
                        console.log(`Converted ${slide.filename} to ${url}`);
                    } catch (e) {
                        console.error(`Failed to convert ${slide.filename}:`, e);
                        newImageUrls[slide.key] = slide.filename;
                    }
                }
            }

            setImageUrls(newImageUrls);
        };

        updateImageUrls();
    }, [state]);

    // CreateImageComponentをメモ化
    const CreateImageComponent = useMemo(() => (key: string, filename: string) => {
        const imageUrl = imageUrls[key] || filename;
        return <Row><Col span={24}><Image src={imageUrl} alt="thumbnail" width={'480px'} height={'100%'} /></Col></Row>;
    }, [imageUrls]);

    return (
        <>
            {
                state.map((slide, index) => (
                    <Space key={slide.key} direction="vertical">
                        {
                            (slide.filename.length > 0 && slide.filename !== defaultFilename) &&
                            CreateImageComponent(slide.key, slide.filename)
                        }
                        <Row>
                            <Col span={23}>
                                <Input placeholder="ファイル名(絶対パス)" value={slide.filename} onChange={(e) => onChangeFilename(index, e.target.value)} required />
                            </Col>
                            <Col span={1}>
                                <Button onClick={() => deleteSlide(slide.key)}>-</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={23} offset={1}>
                                <Input placeholder="タイトル（オプショナル）" value={slide.title} onChange={(e) => onChangeTitle(index, e.target.value)} />
                            </Col>
                        </Row>

                        <RowsComponent index={index} rows={slide.rows} onUpdate={onChildUpdate} />

                        <Row>
                            <Col span={24}>
                                <Button onClick={onAddSlide}>+slide</Button>
                            </Col>
                        </Row>
                    </Space >
                ))
            }

        </>
    );
};