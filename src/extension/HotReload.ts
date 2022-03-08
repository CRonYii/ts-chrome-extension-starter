const filesInDirectory = (dir: DirectoryEntry) => new Promise(resolve =>
    dir.createReader().readEntries(entries =>
        Promise.all(entries.filter(e => e.name[0] !== '.').map(e =>
            e.isDirectory
                ? filesInDirectory(e as DirectoryEntry)
                : new Promise(resolve => (e as FileEntry).file(resolve))
        ))
            .then(files => [].concat(...files))
            .then(resolve)
    )
)

const timestampForFilesInDirectory = (dir: DirectoryEntry) =>
    filesInDirectory(dir).then(files =>
        files.map(f => f.name + f.lastModifiedDate).join())

const reload = () => {
    chrome.tabs.query({ active: true, currentWindow: false }, tabs => {
        if (tabs[0]) { chrome.tabs.reload(tabs[0].id) }
        chrome.runtime.reload()
    })
}

const watchChanges = (dir: DirectoryEntry, lastTimestamp?) => {
    timestampForFilesInDirectory(dir).then(timestamp => {
        if (!lastTimestamp || (lastTimestamp === timestamp)) {
            setTimeout(() => watchChanges(dir, timestamp), 1000) // retry after 1s
        } else {
            reload()
        }
    })

}

chrome.management.getSelf(self => {
    if (self.installType === 'development') {
        console.log('Hot Reload is acitivated.');
        chrome.runtime.getPackageDirectoryEntry(dir => watchChanges(dir))
    }
})