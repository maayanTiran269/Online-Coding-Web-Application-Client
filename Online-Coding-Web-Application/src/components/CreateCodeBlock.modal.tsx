import React, { useState } from 'react';
import { Modal, Input, Button, Form, message } from 'antd';
import axios from 'axios';
import {PlusOutlined} from '@ant-design/icons';
import styles from '../styles/components/CreateCodeBlock.modal.module.scss';
const CreateCodeBlockModal: React.FC = () => {
  // const apiUrl = import.meta.env.VITE_PROD_API_URL;
  const apiUrl = import.meta.env.VITE_DEV_API_URL;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await axios.post(`${apiUrl}/api/code-blocks`, values); // Send data to your NestJS server
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to create code block:', error);
      message.error('Failed to create new code block, Please try again later')
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <>
      <Button className={styles.button} onClick={showModal}>
        <PlusOutlined style={{ fontSize: '24px', fontWeight: 'bold' }}/>
      </Button>
      <Modal
        title="Create New Code Block"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        centered  // Ensures modal is always centered
        width={600} // Adjust the width as needed
        style={{ overflowY: 'auto' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>
          <Form.Item
            name="template"
            label="Template"
            rules={[{ required: true, message: 'Please enter a template' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter template code" />
          </Form.Item>
          <Form.Item
            name="solution"
            label="Solution"
            rules={[{ required: true, message: 'Please enter a solution' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter solution code" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateCodeBlockModal;