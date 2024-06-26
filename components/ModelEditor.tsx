import React from 'react';
import { Select, Stack, Button } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';

interface ModelEditorProps {
  model: string;
  onModelChange: (model: string) => void;
  systemPromptModalOpen: boolean;
  setSystemPromptModalOpen: (open: boolean) => void;
}

const ModelEditor: React.FC<ModelEditorProps> = ({ model, onModelChange, systemPromptModalOpen, setSystemPromptModalOpen }) => {
    const handleModelChange = (value: string | null) => {
        if (value !== null) {
            onModelChange(value);
        }
    };
    return (
        <Stack styles={{
            root: {
            position: 'fixed',
            bottom: '1rem',
            left: '1rem',
            zIndex: 1000,
            },
        }}>
            <Select
            label="Model"
            value={model}
            onChange={handleModelChange}
            data={[
                { value: 'claude-3-haiku-20240307', label: 'Claude-3 Haiku' },
                { value: 'claude-3-sonnet-20240229', label: 'Claude-3 Sonnet' },
                { value: 'claude-3-opus-20240229', label: 'Claude-3 Opus' },
            ]}
            size="xs"
            />
            <Button
            variant="subtle"
            size="compact-sm"
            onClick={() => setSystemPromptModalOpen(true)}
            rightSection={<IconEdit size={16} />}
            >
                Edit System Prompt
            </Button> 
        </Stack>
    );
};

export default ModelEditor;