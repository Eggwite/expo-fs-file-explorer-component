import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, FlatList, Modal, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Icon from 'react-native-vector-icons/FontAwesome';

const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState(FileSystem.documentDirectory);
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const shareFile = async (filePath) => {
    if (!(await Sharing.isAvailableAsync())) {
      alert(`Uh oh, sharing isn't available on your platform`);
      return;
    }
  
    Sharing.shareAsync(filePath);
  };
  

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath]);

  const loadFiles = async (path) => {
    try {
      const fileInfo = await FileSystem.readDirectoryAsync(path);
      setFiles(fileInfo);
    } catch (error) {
      console.error("Error reading directory:", error);
    }
  };

  const openFile = async (filePath) => {
    try {
      const content = await FileSystem.readAsStringAsync(filePath);
      setFileContent(content);
      setModalVisible(true);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };
  const [selectedItem, setSelectedItem] = useState(null); 

  const handlePress = (file) => {
    setSelectedItem(file);
    const filePath = `${currentPath}${file}`;
    if (file.includes('.')) {
      openFile(filePath);
    } else {
      setCurrentPath(`${filePath}/`);
    }
  };

  const handleBack = () => {
    const parentPath = currentPath.split('/').slice(0, -2).join('/') + '/';
    setCurrentPath(parentPath || FileSystem.documentDirectory);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pathText}>{currentPath}</Text>
      {currentPath !== FileSystem.documentDirectory && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={files}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)} style={[styles.fileItem, { flexDirection: 'row', alignItems: 'center' }]}>
  <Icon name={item.includes('.') ? 'file' : 'folder'} size={15} color="red" />
  <Text style={styles.fileText}>{item}</Text>
</TouchableOpacity>
        )}
      />
      <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <ScrollView style={styles.modalContainer}>
  <Text style={styles.modalText}>{fileContent}</Text>
</ScrollView>
        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
        {selectedItem && (
        <TouchableOpacity
          onPress={() => handlePress(selectedItem)}
          onLongPress={() => shareFile(`${currentPath}${selectedItem}`)}
          style={styles.fileItem}
        >
          <Text style={styles.fileText}> Share {selectedItem}</Text>
        </TouchableOpacity>
      )}
    </Modal>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  pathText: {
    fontSize: 18,
    marginBottom: 8,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: 'blue',
  },
  fileItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  fileText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
  },
  closeButton: {
    alignSelf: 'center',
    padding: 8,
    backgroundColor: 'blue',
    borderRadius: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default FileExplorer;
