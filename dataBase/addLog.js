import dataBase from "./dataBase/dataBase";

export function addLog(username, password) {
    dataBase.db.collection("Login").doc(`${username}`).set({
    name: `${username}`,
    senha: `${password}`,
    type: "user",
  })
  .then(() => {
    console.log("Document successfully written!");
  })
  .catch((error) => {
    console.error("Error writing document: ", error);
  })
}
