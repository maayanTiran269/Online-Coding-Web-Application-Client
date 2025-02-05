import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import socket from '../utils/socket';
import axios from 'axios';
import { ICodeBlock } from '../types/codeBlock';
import { debounce } from 'lodash';
import styles from '../styles/pages/CodeBlockPage.module.scss';
import { javascript } from '@codemirror/lang-javascript';
import { message } from 'antd';
import {} from 'antd' 
const CodeBlockPage: React.FC = () => {
  // const apiUrl = import.meta.env.VITE_PROD_API_URL;
  const apiUrl = import.meta.env.VITE_DEV_API_URL;
  
  const { id } = useParams<{ id: string }>(); // Get the code block ID from the URL
  const [code, setCode] = useState<string>('');
  const [role, setRole] = useState<'mentor' | 'student'>();
  const [studentCount, setStudentCount] = useState<number>(0);
  const [title, setTitle] = useState<string>();

  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch code block details (template and solution)
    axios.get<ICodeBlock>(`${apiUrl}/api/code-blocks/${id}`)
      .then(async (response) => {
        setTitle(response.data.title);
      })
      .catch((error => {
        console.error('Failed to fetch code block:', error);
        message.error('Error fetching code block. Please try again later.');
        navigate('/');
      }));

    // Join the room
    socket.emit('join-room', id);

    // Listen for role assignment
    socket.on('role', (data: 'mentor' | 'student') => {
      setRole(data);
    });

    // Listen for student count updates
    socket.on('student-count', (data: number) => {
      setStudentCount((prevCount) => {
        if (data > prevCount) {
          message.info('New student just joined the room 🖐');
        } else if (data < prevCount) {
          message.info('Student just left the room 🏃‍♂️');
        }
        return data; // Update state with the latest data
      });
    });

    // Listen for code updates
    socket.on('code-update', async (data: string) => {
      setCode(data);
    });

    socket.on('code-solved', (data: boolean) => {
      if(data){
        message.success('🎉 Congratulations! You solved the code! 😊');
      }
    });

    socket.on('redirect-lobby', () => {
      navigate(`/`);
      message.info('This room has been closed by the mentor 🚪.');
    });

    // Cleanup on unmount
    return () => {
      socket.removeAllListeners();
      socket.emit('leave-room', id);
    };
  }, [id, navigate, apiUrl]);

  const debouncedEmit = debounce((roomId: string, newCode: string) => {
    socket.emit('code-update', { roomId, code: newCode });
  }, 20); // 100ms delay

  const handleCodeChange = (newCode: string) => {
    if (role === 'student') {
      setCode(newCode);
      if (id !== undefined) {
        debouncedEmit(id, newCode);
      }
    }
  };

  return (
    <>
      <div
        className={styles.pageHeader}
        onClick={() => navigate(`/`)}>
        <label>Code Block Page</label>
        <label>{title}</label>
      </div>
      <div className={styles.stats}>
        <label>Participants: {studentCount}</label>
        <label>Role: {role} {role === 'mentor' ? '👨‍🏫' : '👨‍🎓'}</label>
      </div>
      <CodeMirror
        value={code}
        onChange={handleCodeChange}
        readOnly={role === 'mentor'}
        extensions={[javascript()]}
        className="border rounded"
        height="40vh"
      />
    </>
  );
};

export default CodeBlockPage;