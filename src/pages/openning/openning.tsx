import descriptionImage from "src/assets/images/lobby/description.png";
import logoImage from "src/assets/images/lobby/logo.png";
import { useEffect } from "react";
import styles from "./openning.module.css";
import { useNavigate } from "react-router-dom";

export function OpenningPage() {
  const navigate = useNavigate();

  function jumpToLobby() {
    navigate("/lobby");
  }

  useEffect(() => {
    document.addEventListener("keydown", jumpToLobby);
    let timeoutId = setTimeout(() => {
      jumpToLobby();
      clearTimeout(timeoutId);
    }, 6000);
  }, []);

  return (
    <div className={styles.scene} onClick={jumpToLobby}>
      <img className={styles.logo} src={logoImage} alt="logo" />
      <img
        className={styles.description}
        src={descriptionImage}
        alt="description"
      />
    </div>
  );
}
