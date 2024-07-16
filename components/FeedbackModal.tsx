import React, { useState } from 'react';
import { Modal, Rating, Textarea, Text, Button, Loader, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { IconSend } from '@tabler/icons-react';

interface FeedbackModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: any, token: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ opened, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

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
    if (!executeRecaptcha || typeof executeRecaptcha !== 'function') return;
    const token = await executeRecaptcha('feedbackForm');
    setIsSubmitting(true);
    await onSubmit(values, token);
    setIsSubmitting(false);
    feedbackForm.reset();
  };

  return (
    <Modal
      overlayProps={{
        backgroundOpacity: 0.35,
        blur: 2,
      }}
      radius="lg"
      size="xl"
      opened={opened}
      onClose={onClose}
      title={<Text size="xl" c="#D7D7D7" fw='700'>Submit Feedback</Text>}>
      <form onSubmit={feedbackForm.onSubmit(handleSubmit)}>
        <Text size="md" mt="xs">Accuracy:</Text>
        <Rating {...feedbackForm.getInputProps('accuracy')} size="md" mt="sm" color="eden.5" />
        <Text size="md" mt="md">Quality:</Text>
        <Rating {...feedbackForm.getInputProps('quality')} size="md" mt="sm" color='eden.5' />
        <Textarea
          label="Comments and feedback:"
          size="md"
          styles={{ label: { marginBottom: 10 } }}
          {...feedbackForm.getInputProps('comments')}
          autosize
          minRows={3}
          mt="md"
        />
        <Group mt="md">
          <Button
            leftSection={<IconSend size={16} />}
            autoContrast
            bg="eden.5"
            type="submit"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader size="sm" /> : 'Send'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default FeedbackModal;
