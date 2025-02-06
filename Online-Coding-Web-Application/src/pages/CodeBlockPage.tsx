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
import { } from 'antd'
const CodeBlockPage: React.FC = () => {
  // const apiUrl = import.meta.env.VITE_PROD_API_URL;
  const apiUrl = import.meta.env.VITE_DEV_API_URL;

  const { id } = useParams<{ id: string }>(); // Get the code block ID from the URL
  const [code, setCode] = useState<string>(''); //the code of the block
  const [role, setRole] = useState<'mentor' | 'student'>(); //the role of the user
  const [isSolved, setIsSolved] = useState<boolean>(false); //save the code solve status
  const [studentCount, setStudentCount] = useState<number>(0);//the students number in the room
  const [title, setTitle] = useState<string>(); //the title of the block

  const navigate = useNavigate();//Used in order to navigate between routs

  useEffect(() => {// react hook equivalent to the concept of 'ngOnInit' in angular
    axios.get<ICodeBlock>(`${apiUrl}/api/code-blocks/${id}`).then(async (response) => { //sending http req to the server in order to fetch code block details from the DB
      setTitle(response.data.title);
      setIsSolved(response.data.isSolved);
    }).catch((error => { //handel errors if they appear
      console.error('Failed to fetch code block:', error); //log error in devTools
      message.error('Error fetching code block. Please try again later.'); //notify the user about the error
      navigate('/'); //navigate back to the lobby
    }
    ));

    socket.emit('join-room', id); //notify the server via WebSocket that the user with this id is joining the room

    socket.on('role', (data: 'mentor' | 'student') => { // listen for any role assignment
      setRole(data); //set the new role as the user role in the global state
    });

    socket.on('student-count', (data: number) => { // listen for student count updates
      setStudentCount((prevCount) => { //update the student count in the global state with the new count. Also notifying all the users in the room whether someone left or joined
        if (data > prevCount) { //if the new count is greater then the current count notify that user joined the room
          message.info('New student just joined the room 🖐'); //pop up window announcing that new user just joined the room
        } else if (data < prevCount) { // if the new count is smaller then the current count, notify that user left the room
          message.info('Student just left the room 🏃‍♂️'); //pop up window announcing that new user just joined the room 
        }
        return data; //update state with the latest data
      });
    });

    socket.on('code-update', async (data) => { //listen for code updates
      setCode(data.code); //update the code in the global state
      setIsSolved(data.isSolved)
    });

    socket.on('new-code-status', (data) => { //listen for the solvation status of the code block
      if (data) { //check if the code is solved
        message.success('🎉 Congratulations! You solved the code! 😊'); //pop up window announcing that the code was solved
      }
      setIsSolved(data);
    });

    socket.on('redirect-lobby', (event) => { //listen for a situation where the mentor disconnect from the room
      navigate(`/`); //navigate the student back to the lobby
      if (event === 'mentor-left')
        message.info('This room has been closed by the mentor 🚪.'); //pop up window announcing the student that the room was closed by the mentor
      else if(event === 'deletion')
        message.info('This room has been deleted 🗑'); //pop up window announcing the student that the room was closed by the mentor
    });

    return () => {//cleanup all socket listeners in this component when it unmounts
      socket.removeAllListeners();//remove all of the socket listeners in this component
      socket.emit('leave-room', id);//notify the server via WebSocket that the user with this id is leaving the room
    };
  }, [id, navigate, apiUrl]);

  const debouncedEmit = debounce((roomId: string, newCode: string) => {
    socket.emit('code-update', { roomId, code: newCode }); //notify the server via WebSocket that the code was updated
  }, 20); //set debounce to 20ms to avoid over loading the server when the user type fast.

  const handleCodeChange = (newCode: string) => { //handle code changing when the user type
    if (role === 'student') { //check if the role is acutely student to add another layer of protection from mentor typing.
      setCode(newCode); //update the code in the global state with the new code
      if (id !== undefined) { //making sure room id is defined
        debouncedEmit(id, newCode); //send the code to debounce before sending it to the server. also id is not necessary here because it's from the global state but i didn't had time to fix and test so it stays this way  
      }
    }
  };

  return (
    <>
      <div
        className={styles.pageHeader}
        onClick={() => navigate(`/`)}
      >
        <label>Code Block Page</label>
        <label>{title}</label>
      </div>
      <div className={styles.stats}>
        <label>Participants: {studentCount}</label>
        <label>{isSolved ? 'Solved ✅' : 'On development 💻'}</label>
        {/* Want to add here between them 'isSolved' check that will always show the user the solve status of the code 'Solved' or 'In progress' */}
        <label>Role: {role} {role === 'mentor' ? '👨‍🏫' : '👨‍🎓'}</label>
      </div>
      <CodeMirror
        value={code}
        onChange={handleCodeChange}
        readOnly={role === 'mentor'}
        theme={'dark'}
        extensions={[javascript()]} //set the Syntax highlighting for JS
        className="border rounded"
      />
    </>
  );
};

export default CodeBlockPage;