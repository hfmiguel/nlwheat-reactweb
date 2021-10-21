import styles from './styles.module.scss';
import { api } from '../../services/api';
import { FormEvent, useContext, useEffect, useState } from 'react';
import { VscGithubInverted, VscSignOut } from 'react-icons/vsc';
import { AuthContext } from '../../contexts/auth';


export function SendMessageForm() {
  const { user, singOut } = useContext(AuthContext);
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {

    event.preventDefault();

    if (!message.trim()) return;

    const token = localStorage.getItem('@dowhile:token');
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    await api.post('/messages', {
      text: message
    }).then((response) => {
      console.log(response);
    });

    setMessage('');
  }

  return (
    <div className={styles.sendMessageFormWrapper}>
      <button className={styles.signOutButton} onClick={singOut}>
        <VscSignOut size="32" />
      </button>
      <header className={styles.signedUserInformation}>
        <div className={styles.userImage}>
          <img src={user?.avatar_url} alt={user?.name} />
        </div>
        <strong className={styles.userName}>
          {user?.name}
        </strong>
        <span className={styles.userGithub}>
          <VscGithubInverted size="32" />
          {user?.login}
        </span>

      </header>

      <form className={styles.sendMessageForm} onSubmit={handleSubmit} method='post'>
        <label htmlFor="message">Mensagem</label>
        <textarea
          name="message"
          id="message"
          placeholder="Digite sua mensagem"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        >
        </textarea>
        <button type='submit' >
          Enviar mensagem
        </button>
      </form>
    </div>
  );
}