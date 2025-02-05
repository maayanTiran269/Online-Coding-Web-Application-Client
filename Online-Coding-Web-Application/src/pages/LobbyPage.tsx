import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ICodeBlock } from '../types/codeBlock';
import styles from '../styles/pages/LobbyPage.module.scss'
import { message } from 'antd';
import CreateCodeBlockModal from '../components/CreateCodeBlock.modal';
import socket from '../utils/socket';
import { CodeOutlined } from '@ant-design/icons';

const LobbyPage: React.FC = () => {
  const apiUrl = import.meta.env.VITE_PROD_API_URL;
  // const apiUrl = import.meta.env.VITE_DEV_API_URL;

  const [codeBlocks, setCodeBlocks] = useState<ICodeBlock[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get<ICodeBlock[]>(`${apiUrl}/api/code-blocks`)
      .then((response) => setCodeBlocks(response.data))
      .catch((error) => {
        console.error('Error fetching code blocks:', error);
        message.error('Unable to retrieve code blocks. Please try again later.');
      }
      );

    socket.on('new-code-block', (newCodeBlock: ICodeBlock) => {
      setCodeBlocks((prevBlocks) => [...prevBlocks, newCodeBlock]);
      message.info('New code block add to the system')
    });

  }, [apiUrl]);

  return (
    <div>
      <div className={styles.pageHeader}>
        <label >Choose Code Block</label>
        <CreateCodeBlockModal />
      </div>
      <div className={styles.codeBlocksContainer}>
        {codeBlocks.map((block) => (
          <div
            key={block._id}
            className={styles.codeBox}
            onClick={() => navigate(`/code-block/${block._id}`)}
          >
            <label className={styles.header}>
              <CodeOutlined />
              {block.title}
            </label>
            <p className={styles.body}>
              {block.template}
            </p>
            <label className={styles.footer}>
              {`${block.createdAt}`}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LobbyPage;