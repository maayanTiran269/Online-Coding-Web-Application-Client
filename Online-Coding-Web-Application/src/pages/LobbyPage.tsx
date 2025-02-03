import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ICodeBlock } from '../types/codeBlock';

const LobbyPage: React.FC = () => {
  const [codeBlocks, setCodeBlocks] = useState<ICodeBlock[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get<ICodeBlock[]>('http://localhost:3000/api/code-blocks')
      .then((response) => setCodeBlocks(response.data))
      .catch((error) => console.error('Error fetching code blocks:', error));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Choose Code Block</h1>
      <ul>
        {codeBlocks.map((block) => (
          <li
            key={block._id}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => navigate(`/code-block/${block._id}`)}
          >
            {block.template}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LobbyPage;