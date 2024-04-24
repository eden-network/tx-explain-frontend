import React, { useState } from 'react';
import { Modal, Rating, Textarea, Text, Button, Loader, Group } from '@mantine/core';
import { useForm } from '@mantine/form';

interface FeedbackModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ opened, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
    feedbackForm.reset();
  };

  return (
    <Modal size="xl" opened={opened} onClose={onClose} title="Submit Feedback">
      <form onSubmit={feedbackForm.onSubmit(handleSubmit)}>
        <Text size="md" mt="xs">Accuracy:</Text>
        <Rating {...feedbackForm.getInputProps('accuracy')} size="md" mt="sm" />
        <Text size="md" mt="md">Quality:</Text>
        <Rating {...feedbackForm.getInputProps('quality')} size="md" mt="sm" />
        <Textarea
          label="Comments:"
          size="md"
          styles={{ label: { marginBottom: 10 } }}
          {...feedbackForm.getInputProps('comments')}
          autosize
          minRows={10}
          mt="md"
        />
        <Group mt="md">
          <Button autoContrast type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? <Loader size="sm" /> : 'Submit Feedback'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default FeedbackModal;