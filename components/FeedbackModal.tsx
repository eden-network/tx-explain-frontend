import React from 'react';
import { Modal, Rating, Textarea, Text, Button } from '@mantine/core';
import { useForm } from '@mantine/form';

interface FeedbackModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ opened, onClose, onSubmit }) => {
  const feedbackForm = useForm({
    initialValues: {
      accuracy: 0,
      quality: 0,
      comments: '',
    },
    validate: {
      accuracy: (value) => (value > 0 ? null : 'Please provide an accuracy score'),
      quality: (value) => (value > 0 ? null : 'Please provide a quality score'),
    },
  });

  const handleSubmit = (values: any) => {
    onSubmit(values);
    feedbackForm.reset();
  };

  return (
    <Modal size="xl" opened={opened} onClose={onClose} title="Submit Feedback">
      <form onSubmit={feedbackForm.onSubmit(handleSubmit)}>
        <Text size="md" mt="xs">Accuracy:</Text>
        <Rating
          {...feedbackForm.getInputProps('accuracy')}
          size="md"
          mt="sm"
        />
        <Text size="md" mt="md">Quality:</Text>
        <Rating
          {...feedbackForm.getInputProps('quality')}
          size="md"
          mt="sm"
        />
        <Textarea
          label="Comments:"
          size="md"
          styles={{ 
            input: { minHeight: 700 },
            label: { marginBottom: 10 }, 
          }}
          {...feedbackForm.getInputProps('comments')}
          minRows={40}
          mt="md"
        />
        <Button type="submit" fullWidth mt="md">
          Submit Feedback
        </Button>
      </form>
    </Modal>
  );
};

export default FeedbackModal;