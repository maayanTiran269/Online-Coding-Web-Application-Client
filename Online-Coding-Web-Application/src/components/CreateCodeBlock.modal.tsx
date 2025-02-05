import React, { useState } from 'react';
import { Modal, Input, Button, Form, message } from 'antd';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';
import styles from '../styles/components/CreateCodeBlock.modal.module.scss';
const CreateCodeBlockModal: React.FC = () => {
  const apiUrl = import.meta.env.VITE_PROD_API_URL; //url for production
  // const apiUrl = import.meta.env.VITE_DEV_API_URL; //url for development
  const [isModalVisible, setIsModalVisible] = useState(false); //modal visibility status
  const [form] = Form.useForm(); //ant-design form

  const showModal = () => { //when user click the button to open the modal it updates the isModalVisible global state to true(visible)
    setIsModalVisible(true);//updates the isModalVisible global state to true(visible)
  };

  const handleOk = async () => { //when user press ok, send http req with all the data to the server for creation of new block
    try {
      const values = await form.validateFields(); //make sure all the form fields are valid
      await axios.post(`${apiUrl}/api/code-blocks`, values); // send http req with all the data to the server for creation of new block
      setIsModalVisible(false); //updates the isModalVisible global state to false(hide)
      form.resetFields(); //reset all the form fields for next time
    } catch (error) { //handel errors if they appear
      console.error('Failed to create code block:', error);//log error in devTools
      message.error('Failed to create new code block, Please try again later');//notify the user about the error
    }
  };

  const handleCancel = () => {//when user press cancel, updates the isModalVisible global state to false(hide) and reset all the fields
    setIsModalVisible(false);//updates the isModalVisible global state to false(hide)
    form.resetFields();//reset all the fields
  };

  return (
    <>
      <Button
        className={styles.button}
        onClick={showModal}
      >
        <PlusOutlined style={{ fontSize: '24px', fontWeight: 'bold' }} />
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
        <Form
          form={form}
          layout="vertical"
        >
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
            <Input.TextArea
              rows={4}
              placeholder="Enter template code" />
          </Form.Item>
          <Form.Item
            name="solution"
            label="Solution"
            rules={[{ required: true, message: 'Please enter a solution' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter solution code" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateCodeBlockModal;