import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import socket from '../utils/socket';
import axios from 'axios';
import { ICodeBlock } from '../types/codeBlock';
import { debounce } from 'lodash';
import styles from '../styles/pages/CodeBlockPage.module.scss';
import { javascript } from '@codemirror/lang-javascript';

const CodeBlockPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the code block ID from the URL
  const [code, setCode] = useState<string>('');
  const [solution, setSolution] = useState<string>('')
  const [role, setRole] = useState<'mentor' | 'student'>();
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [title, setTitle] = useState<string>();

  // const solutionRef = useRef<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch code block details (template and solution)
    axios.get<ICodeBlock>(`https://online-coding-web-application-server.onrender.com/api/code-blocks/${id}`)
      .then(async (response) => {
        setTitle(response.data.title);
        setCode(response.data.template);
        setSolution(response.data.solution);
        // solutionRef.current = response.data.solution;
      })
      .catch((error => {
        console.error('Failed to fetch code block:', error);
        alert('Error fetching code block. Please try again later.');
      }));

    // Join the room
    socket.emit('join-room', id);

    // Listen for role assignment
    socket.on('role', (data: 'mentor' | 'student') => {
      setRole(data);
    });

    // Listen for student count updates
    socket.on('student-count', (data: number) => {
      setStudentCount(data);
    });

    // Listen for code updates
    socket.on('code-update', async (data: string) => {
      setCode(data);
      setIsSolved(data === solution);
    });

    socket.on('redirect-lobby', () => {
      navigate(`/`);
    });

    // Cleanup on unmount
    return () => {
      socket.removeAllListeners();
      socket.emit('leave-room', id);
    };
  }, [id, solution, navigate]);

  const debouncedEmit = debounce((roomId: string, newCode: string) => {
    socket.emit('code-update', { roomId, code: newCode });
  }, 0); // 100ms delay

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
        height="50vh"
      />
      {isSolved && <div>😊</div>}
    </>
  );
};

export default CodeBlockPage;