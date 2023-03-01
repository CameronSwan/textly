const { app, BrowserWindow, ipcMain, dialog, nativeTheme, Menu, MenuItem } = require('electron')
const path = require('path')
const fs = require('fs')

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 900,
        minWidth: 900,
        height: 900,
        minHeight: 900,
        autoHideMenuBar: true,
        webPreferences: {
            spellcheck: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('index.html')

    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
          nativeTheme.themeSource = 'light'
        } else {
          nativeTheme.themeSource = 'dark'
        }
        return nativeTheme.shouldUseDarkColors
    })

    return mainWindow
}

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({ filters: [{ name: '.txt', extensions: ['txt'] }] })
    if (!canceled) {
        const data = await fs.readFileSync(filePaths[0], 'utf8')
        return {
            fileName: filePaths[0].substring(filePaths[0].lastIndexOf('\\') + 1),
            filePath: filePaths[0],
            fileData: data
        }
    }
}

async function handleFileSave(e, fileData) {
    if (fileData.from === 'saveas' || fileData.path === '') {
        const { canceled, filePath } = await dialog.showSaveDialog({ defaultPath: fileData.path, filters: [{ name: '.txt', extensions: ['txt'] }] })
        if (!canceled) {
            fs.writeFileSync(filePath, fileData.data);
        }
    }
    else fs.writeFileSync(fileData.path, fileData.data)

    // if (fileData.from === 'saveas') {
    //     const { canceled, filePath } = await dialog.showSaveDialog()
    //     if (!canceled) {
    //         if (fileData.from === 'save') fs.writeFileSync(filePath, fileData.data);
    //         else {
    //             fs.writeFileSync(filePath, fileData.data)
    //         }
    //     }
    // }
    // else fs.writeFileSync(fileData.path, fileData.data)
}

app.whenReady().then(() => {
    const mainWindow = createWindow()

    ipcMain.handle('dialog:openFile', handleFileOpen)
    ipcMain.on('dialog:saveFile', handleFileSave)

    mainWindow.webContents.on('context-menu', (event, params) => {
        const menu = new Menu()
      
        for (const suggestion of params.dictionarySuggestions) {
          menu.append(new MenuItem({
            label: suggestion,
            click: () => mainWindow.webContents.replaceMisspelling(suggestion)
          }))
        }
      
        if (params.misspelledWord) {
          menu.append(new MenuItem({
              label: 'Add to dictionary',
              click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
            })
          )
        }
      
        menu.popup()
      })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit()
})