import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ICodeBlock } from '../types/codeBlock';
import styles from '../styles/pages/LobbyPage.module.scss'
const LobbyPage: React.FC = () => {
  const [codeBlocks, setCodeBlocks] = useState<ICodeBlock[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get<ICodeBlock[]>('http://localhost:3000/api/code-blocks')
      .then((response) => setCodeBlocks(response.data))
      .catch((error) => console.error('Error fetching code blocks:', error));
  }, []);

  return (
    <div>
      <div className={styles.pageHeader}>
        <label >Choose Code Block</label>
      </div>
      <div className={styles.codeBlocksContainer}>
      {codeBlocks.map((block) => (
        <div 
          key={block._id}
          className={styles.codeBox}
          onClick={() => navigate(`/code-block/${block._id}`)}
        >
          {/* <div className={styles.codeBoxHeader}>
            <label>{block.title}</label>
            <label>Code Block</label>
          </div> */}
          
          {block.template}
        </div>
      ))}
      </div>
    </div>
  );
};

export default LobbyPage;