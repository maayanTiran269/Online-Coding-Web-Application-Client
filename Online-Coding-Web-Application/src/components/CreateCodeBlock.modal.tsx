import React, { useState } from 'react';
import { Modal, Input, Button, Form, message, FormInstance, Space } from 'antd';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';
import styles from '../styles/components/CreateCodeBlock.modal.module.scss';

const CreateCodeBlockModal: React.FC = () => {
  const apiUrl = import.meta.env.VITE_PROD_API_URL; //url for production
  // const apiUrl = import.meta.env.VITE_DEV_API_URL; //url for development
  const [isModalVisible, setIsModalVisible] = useState(false); //modal visibility status
  const [form] = Form.useForm(); //ant-design form

  interface SubmitButtonProps {
    form: FormInstance;
  }
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

  //disable the submit button until all the fields are valid
  const SubmitButton: React.FC<React.PropsWithChildren<SubmitButtonProps>> = ({ form, children }) => {
    const [submittable, setSubmittable] = React.useState<boolean>(false);

    // Watch all values
    const values = Form.useWatch([], form);

    React.useEffect(() => {
      form
        .validateFields({ validateOnly: true }) //check validation of the fields
        .then(() => setSubmittable(true))
        .catch(() => setSubmittable(false));
    }, [form, values]);

    return (
      <Button type="primary" htmlType="submit" disabled={!submittable} onClick={handleOk}>
        {children}
      </Button>
    );
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
        footer={null} //remove the default ok cancel buttons at the end of the modal
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: 'Please enter a title' },
              {
                validator: (_, value) =>
                  value && value.trim() !== '' //validate that the user dose not enter only spaces or enters
                    ? Promise.resolve()
                    : Promise.reject(new Error('Title cannot be empty or only spaces/enters/tabs'))
              }
            ]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="template"
            label="Template"
            rules={[
              { required: true, message: 'Please enter a template' },
              {
                validator: (_, value) =>
                  value && value.trim() !== '' //validate that the user dose not enter only spaces or enters
                    ? Promise.resolve()
                    : Promise.reject(new Error('Template cannot be empty or only spaces/enters/tabs'))
              }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter template code" />
          </Form.Item>

          <Form.Item
            name="solution"
            label="Solution"
            rules={[
              { required: true, message: 'Please enter a Solution' },
              {
                validator: (_, value) =>
                  value && value.trim() !== '' //validate that the user dose not enter only spaces or enters
                    ? Promise.resolve()
                    : Promise.reject(new Error('Solution cannot be empty or only spaces/enters/tabs'))
              }
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter solution code" />
          </Form.Item>

          <Form.Item>
            <Space>
              <SubmitButton form={form}>Submit</SubmitButton>
              <Button htmlType="reset">Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateCodeBlockModal;