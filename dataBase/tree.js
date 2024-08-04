import dataBase from "./dataBase";

import { firestore } from './firebase';

// Adicionar um novo nó
export const addNode = async (username, nodeId, node) => {
  try {
    const userDoc = firestore.collection('users').doc(username);
    const treeDoc = userDoc.collection('tree').doc(nodeId);

    // Adiciona o novo nó
    await treeDoc.set({
      name: node.name,
      type: node.type,
      children: node.children || {}
    });

    // Atualiza o nó pai se for um nó filho
    if (node.parent) {
      const parentDoc = userDoc.collection('tree').doc(node.parent);
      await parentDoc.update({
        [`children.${nodeId}`]: true
      });
    }

    return true;
  } catch (error) {
    console.error('Error adding node:', error.message);
    return false;
  }
};

// Deletar um nó
export const deleteNode = async (username, nodeId) => {
  try {
    const userDoc = firestore.collection('users').doc(username);
    const nodeDoc = userDoc.collection('tree').doc(nodeId);

    // Exclui o nó
    await nodeDoc.delete();

    // Remove referências de filhos dos pais
    const nodeSnapshot = await nodeDoc.get();
    const nodeData = nodeSnapshot.data();
    if (nodeData && nodeData.children) {
      for (const childId of Object.keys(nodeData.children)) {
        await deleteNode(username, childId);
      }
    }

    // Atualiza os pais para remover a referência ao nó deletado
    const querySnapshot = await userDoc.collection('tree').where(`children.${nodeId}`, '==', true).get();
    querySnapshot.forEach(async (doc) => {
      await doc.ref.update({
        [`children.${nodeId}`]: firestore.FieldValue.delete()
      });
    });

    return true;
  } catch (error) {
    console.error('Error deleting node:', error.message);
    return false;
  }
};

// Obter toda a árvore de um usuário
export const getTree = async (username) => {
  try {
    const userDoc = firestore.collection('users').doc(username);
    const treeSnapshot = await userDoc.collection('tree').get();

    const tree = {};
    treeSnapshot.forEach(doc => {
      tree[doc.id] = doc.data();
    });

    return tree;
  } catch (error) {
    console.error('Error getting tree:', error.message);
    return {};
  }
};
