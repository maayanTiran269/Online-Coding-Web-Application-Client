import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import socket from '../utils/socket';
import axios from 'axios';
import { RoleAssignmentData, CodeUpdateData, StudentCountData } from '../types/socket';
import { ICodeBlock } from '../types/codeBlock';
import { debounce } from 'lodash';
import styles from '../styles/pages/CodeBlockPage.module.scss';

const CodeBlockPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get the code block ID from the URL
  const [code, setCode] = useState<string>('');
  const [role, setRole] = useState<'mentor' | 'student'>();
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [title, setTitle] = useState<string>();
  
  const solutionRef = useRef<string>('');

  useEffect(() => {
    // Fetch code block details (template and solution)
    axios.get<ICodeBlock>(`http://localhost:3000/api/code-blocks/${id}`)
    .then((response) => {
      setTitle(response.data.title)
      setCode(response.data.template);
      solutionRef.current = response.data.solution;
    })
    .catch((error => {
      console.error('Failed to fetch code block:', error);
      alert('Error fetching code block. Please try again later.');
    }));

    

    // Listen for role assignment
    socket.on('role', (data: RoleAssignmentData) => {
      setRole(data.role);
    });

    // Listen for code updates
    socket.on('code-update', (data: CodeUpdateData) => {
      if(data.roomId === id)
      {
        setCode(data.code);
        setIsSolved(data.code === solutionRef.current);
      }
    });

    // Listen for student count updates
    socket.on('student-count', (data: StudentCountData) => {
      setStudentCount(data.count);
    });

    // Join the room
    socket.emit('join-room', id);
    
    // Cleanup on unmount
    return () => {
      socket.off('role');
      socket.off('code-update');
      socket.off('student-count');
      socket.emit('leave-room', id);

      socket.emit('leave-room', id);
    };
  }, [id]);

  const debouncedEmit = debounce((roomId: string, newCode: string) => {
    socket.emit('code-update', { roomId, code: newCode });
  }, 300); // 300ms delay

  const handleCodeChange = (newCode: string) => {
    if (role === 'student') {
      setCode(newCode);
      if(id !== undefined) {
        debouncedEmit( id , newCode);
      }  
    }
  };

  return (
    <div className="p-4">
      <div className={styles.pageHeader}>
        <label >Code Block Page</label>
        <label>{title}</label>
      </div>
      <div className={styles.stats}>
        <label>Participants: {studentCount}.</label>
        <label>Role: {role} {role === 'mentor' ? '👨‍🏫' : '👨‍🎓'}.</label>
      </div>
      <CodeMirror
        value={code}
        onChange={handleCodeChange}
        readOnly={role === 'mentor'}
        className="border rounded"
        height="792px"
      />
      {isSolved && <div className="text-6xl mt-4">😊</div>}
    </div>
  );
};

export default CodeBlockPage;