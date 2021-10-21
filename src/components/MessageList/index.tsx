import styles from './styles.module.scss';
import logo from '../../assets/logo.svg';
import { api } from '../../services/api';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

type MessageProps = {
  id: string,
  text: string,
  user_id: string,
  created_at: string,
  user: {
    name: string,
    avatar_url: string
  }
}

const messagesQueue: MessageProps[] = [];

const socket = io('http://localhost:3000');

socket.on('new_message', (message: MessageProps) => {
  console.log(message);
  messagesQueue.push(message);
});

export function MessageList() {

  /**
   * @var messages: Array<MessageProps>
   * @description: Array of messages
   */
  const [messages, setMessages] = useState<MessageProps[]>([]);

  useEffect(() => {

    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages(prevState => [
          messagesQueue[0],
          prevState[0],
          prevState[1]
        ].filter(Boolean));

        messagesQueue.shift();
      }
    }, 3000);

  }, [])
  /**
   * Executa ao iniciar o componente
   */
  useEffect(() => {

    /**
     * Get messages from node API
     */
    api.get<MessageProps[]>('/messages/list').then(response => {
      /**
       * Salva as mensagens no state
       */
      setMessages(response.data);
    });
  }, [])

  return (
    <div className={styles.messageListWrapper}>
      <img src={logo} alt='DoWhile 2021' />
      <ul className={styles.messageList}>
        {
          messages.map(message => {
            return (
              <li className={styles.message} key={Math.random()}>
                <p className={styles.messageContent}>
                  {message.text}
                </p>
                <div className={styles.messageUser}>
                  <div className={styles.userImage}>
                    <img src={message.user.avatar_url} alt={message.user.name} />
                  </div>
                  <span>
                    {message.user.name}
                  </span>
                </div>
              </li>
            )
          })
        }
      </ul>
    </div>
  );
}