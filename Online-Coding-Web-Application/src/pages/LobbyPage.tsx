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
  const [codeBlocks, setCodeBlocks] = useState<ICodeBlock[]>([]); //save array of all the blocks in the global state
  const navigate = useNavigate(); //Used in order to navigate between routs

  useEffect(() => { // react hook equivalent to the concept of 'ngOnInit' in angular
    axios.get<ICodeBlock[]>(`${apiUrl}/api/code-blocks`).then((response) => { //sending http req to the server in order to fetch all the codeBlocks from the DB
        setCodeBlocks(response.data); // save the blocks from the DB in the global state
      }).catch(
        (error) => { //handel errors if they appear
          console.error('Error fetching code blocks:', error); //log error in devTools
          message.error('Unable to retrieve code blocks. Please try again later.'); //notify the user about the error
        }
      );

    socket.on('new-code-block', (newCodeBlock: ICodeBlock) => { //listen for creations of blocks
      setCodeBlocks((prevBlocks) => [...prevBlocks, newCodeBlock]); //get the current blocks in the state in order to create a new array and add the new block in the end of it
      message.info('New code block add to the system'); //notify the user that new block just add to the system
    });


    socket.on('code-deletion', (id) => { //listen for deletion of blocks
      setCodeBlocks((prev) => prev.filter(block => block._id !== id));//get the current blocks in the state, create new array of all the blocks that dose not have the deleted block id 
      message.success('Code block deleted successfully'); //notify the user that a block just got deleted
    });

    return () => { //cleanup all socket listeners in this component when it unmounts
      socket.removeAllListeners();//remove all of the socket listeners in this component
    };
  }, [apiUrl]);

  const handleDelete = async (id: string) => {
    try {
      axios.delete(`${apiUrl}/api/code-blocks/${id}`); //sends 'DELETE' http req to the server with the block id in order to delete it. 
    } catch (error) { //handel errors if they appear
      console.error('Error deleting code block:', error); //log error in devTools
      message.error('Failed to delete code block'); //notify the user about the error
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <label>Choose Code Block</label>
        <CreateCodeBlockModal />
      </div>

      <div className={styles.codeBlocksContainer}>
        {
          codeBlocks.map((block) => { //loop through all the blocks and create their codeBox
            const handleContainerClick = () => { //when user click the codeBox it will navigate him to the codeBlock page of this block
              navigate(`/code-block/${block._id}`);// navigate the user to the codeBlock page
            };

            const handleDeleteClick = (e: React.MouseEvent) => { //prevent (until event end) navigation to the codeBlock page when clicking the delete button
              e.stopPropagation(); //stop the navigation process
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
          })
        }
      </div>
    </div>
  );
};

export default LobbyPage;



