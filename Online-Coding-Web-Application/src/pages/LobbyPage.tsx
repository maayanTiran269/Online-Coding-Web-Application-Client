import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ICodeBlock } from '../types/codeBlock';
import styles from '../styles/pages/LobbyPage.module.scss'
import { message, Popconfirm } from 'antd';
import CreateCodeBlockModal from '../components/CreateCodeBlock.modal';
import socket from '../utils/socket';
import { CodeOutlined, DeleteOutlined } from '@ant-design/icons';

const LobbyPage: React.FC = () => {
  // const apiUrl = import.meta.env.VITE_PROD_API_URL;
  const apiUrl = import.meta.env.VITE_DEV_API_URL;

  const [codeBlocks, setCodeBlocks] = useState<ICodeBlock[]>([]); //save the array of all the blocks in the state
  const navigate = useNavigate();

  useEffect(() => {
    axios.get<ICodeBlock[]>(`${apiUrl}/api/code-blocks`).then(
      (response) => {
        setCodeBlocks(response.data)
      })
      .catch(
        (error) => {
          console.error('Error fetching code blocks:', error);
          message.error('Unable to retrieve code blocks. Please try again later.');
        }
      );

    socket.on('new-code-block', (newCodeBlock: ICodeBlock) => {
      setCodeBlocks((prevBlocks) => [...prevBlocks, newCodeBlock]);
      message.info('New code block add to the system')
    });

    socket.on('code-deletion', (id) => {
      setCodeBlocks(prev => prev.filter(block => block._id !== id));
      message.success('Code block deleted successfully');
    });

    return () => {
      socket.removeAllListeners();
    };

  }, [apiUrl]);

  const handleDelete = async (id: string) => {
    try {
      axios.delete(`${apiUrl}/api/code-blocks/${id}`);
    } catch (error) {
      console.error('Error deleting code block:', error);
      message.error('Failed to delete code block');
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <label >Choose Code Block</label>
        <CreateCodeBlockModal />
      </div>
      <div className={styles.codeBlocksContainer}>
        {codeBlocks.map((block) => {
          const handleContainerClick = () => {
            navigate(`/code-block/${block._id}`);
          };

          const handleDeleteClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            // The Popconfirm will handle the actual deletion
          };

          return (
            <div
              key={block._id}
              className={styles.codeBox}
              onClick={handleContainerClick}
            >
              <div className={styles.header}>
                <label>
                  <CodeOutlined />
                  {block.title}
                </label>
                <div onClick={handleDeleteClick}>
                  <Popconfirm
                    title="Delete this code block?"
                    description="Are you sure you want to delete this code block?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(block._id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="Yes"
                    cancelText="No"
                  >
                    <DeleteOutlined
                      className={styles.deleteIcon}
                    />
                  </Popconfirm>
                </div>
              </div>

              <p className={styles.body}>
                {block.template}
              </p>
              <label className={styles.footer}>
                {`${block.createdAt}`}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LobbyPage;



