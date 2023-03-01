let currentFileName = 'No File Selected'
let currentFilePath = ''

const btnNew = document.getElementById('btn-new')
const btnOpen = document.getElementById('btn-open')
const btnSave = document.getElementById('btn-save')
const btnSaveAs = document.getElementById('btn-save-as')
const btnMode = document.getElementById('btn-mode')
const h1CurrentFile = document.getElementById('current-file')
const textArea = document.getElementById('text-area')

btnMode.value = window.darkMode ? '🌙' : '🔆'
h1CurrentFile.innerHTML = currentFileName

document.getElementById('btn-mode').addEventListener('click', async () => {
  const isDarkMode = await window.darkMode.toggle()
  document.getElementById('btn-mode').value = isDarkMode ? '🔆' : '🌙'
})

btnNew.addEventListener('click', (e) => {
  currentFileName = 'No File Selected'
  currentFilePath = ''
  h1CurrentFile.innerHTML = currentFileName
  textArea.value = ''
})

btnOpen.addEventListener('click', async () => {
  const { fileName, filePath, fileData } = file = await window.electronAPI.openFile()
  currentFileName = fileName
  currentFilePath = filePath
  h1CurrentFile.innerHTML = currentFileName
  textArea.value = fileData
})

btnSave.addEventListener('click', (e) => {
  window.electronAPI.saveFile({from: 'save', data: textArea.value, path: currentFilePath})
})

btnSaveAs.addEventListener('click', (e) => {
  window.electronAPI.saveFile({from: 'saveas', data: textArea.value, path: currentFilePath})
})