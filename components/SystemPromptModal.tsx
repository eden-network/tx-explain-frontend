import React from 'react';
import { Modal, Textarea, Button } from '@mantine/core';

interface SystemPromptModalProps {
  opened: boolean;
  onClose: () => void;
  systemPrompt: string;
  onSystemPromptChange: (prompt: string) => void;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  opened,
  onClose,
  systemPrompt,
  onSystemPromptChange,
}) => {
  return (
    <Modal size="lg" opened={opened} onClose={onClose} title="Edit System Prompt">
      <Textarea
        value={systemPrompt}
        onChange={(event) => onSystemPromptChange(event.currentTarget.value)}
        autosize
        minRows={6}
      />
      <Button fullWidth mt="md" onClick={onClose}>
        Save
      </Button>
    </Modal>
  );
};

export default SystemPromptModal;