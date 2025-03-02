import { useRef, useState } from "react";
import { Button, Col, Input, InputNumber, message, Row } from "antd";

import { v4 as uuidv4 } from "uuid";


interface UpdateRowsProps {
    index: number;
    rows: RowValue[];
    onUpdate: (index: number, rows: RowValue[]) => void;
};

export const RowsComponent = (props: UpdateRowsProps) => {
    const [state, setState] = useState<RowValue[]>(props.rows);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const onChildUpdate = (index: number, row: RowValue) => {
        setState((prev) => {
            const newState = [...prev];
            newState[index] = row;
            props.onUpdate(props.index, newState);
            return newState;
        });
    };

    const onChildAdd = (index: number) => {
        setState((prev) => {
            const key = uuidv4();
            const newRow = { key: key, voiceId: 0, content: '' };
            let newState;

            // 指定インデックスが配列長より大きい場合は新規追加
            if (index >= prev.length - 1) {
                newState = [...prev, newRow];
            } else {
                // 指定インデックスの次に追加
                newState = [
                    ...prev.slice(0, index + 1),
                    newRow,
                    ...prev.slice(index + 1)
                ];
            }

            // 親コンポーネントの状態も更新
            props.onUpdate(props.index, newState);
            return newState;
        });

        // 新しい行が追加された後にフォーカスを設定
        setTimeout(() => {
            if (inputRefs.current[index + 1]) {
                inputRefs.current[index + 1]?.focus();
            }
        }, 0);
    };


    // 各行削除後にinputRefsを更新するメソッドを追加
    const updateInputRefs = (updatedRows: RowValue[]) => {
        // 新しい配列サイズに合わせてinputRefsを再設定
        inputRefs.current = inputRefs.current.slice(0, updatedRows.length);
    };

    const onDeleteRow = (key: string) => {
        if (state.length <= 1) {
            message.open({
                type: 'warning',
                content: '最小配列です。削除する場合はスライドの削除を検討してください。',
                duration: 3
            });
            return;
        }

        setState((prev) => {
            const updateRows = prev.filter((row) => row.key !== key);
            // 親コンポーネントの状態も更新
            props.onUpdate(props.index, updateRows);
            updateInputRefs(updateRows);
            return updateRows;
        });
    }

    return (
        <>
            {
                state.map((row, index) => (
                    <Row key={row.key}>
                        <RowComponent index={index} row={row} onUpdate={onChildUpdate} onAdd={onChildAdd} inputRef={(el) => inputRefs.current[index] = el} onDelete={onDeleteRow} />
                    </Row>
                ))
            }
        </>
    );
};

export interface UpdateRowProps {
    index: number;
    row: RowValue;
    onUpdate: (index: number, row: RowValue) => void;
    onAdd: (index: number) => void;
    onDelete: (key: string) => void;
    inputRef: (el: HTMLInputElement | null) => void;
};

export interface RowValue {
    key: string;
    voiceId: number;
    content: string;
}

const RowComponent = (props: UpdateRowProps) => {
    const [voiceId, setVoiceId] = useState<number>(props.row.voiceId);
    const [content, setContent] = useState<string>(props.row.content);

    const onChangeVoiceId = (target: number | null) => {
        if (target === null) {
            return;
        }
        setVoiceId(target);
        props.onUpdate(props.index, { key: props.row.key, voiceId: target, content });
    };

    const onChangeContent = (target: string) => {
        setContent(target);
        props.onUpdate(props.index, { key: props.row.key, voiceId, content: target });
    };

    const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') {
            return;
        }
        props.onAdd(props.index);
    };

    return (
        <>
            <Col span={3} offset={2}>
                <InputNumber ref={props.inputRef} value={voiceId} onChange={(e) => onChangeVoiceId(e)} />
            </Col>
            <Col span={18}>
                <Input value={content} onChange={(e) => onChangeContent(e.target.value)} onKeyDown={(e) => onEnter(e)} />
            </Col>
            <Col span={1}>
                <Button onClick={() => props.onDelete(props.row.key)}>-</Button>
            </Col>
        </>
    );
}