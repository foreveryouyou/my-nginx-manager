const {
    exec
} = require('child_process')
const {
    dialog
} = require('electron').remote
const fs = require('fs');

function init() {
    // todo 窗口激活时刷新，否则暂停刷新
    setInterval(refresh(), 3000);
    // setNginxPath();
}

function doStart() {
    alert('start nginx')
}

function doStop() {
    alert('stop nginx')
    // 'taskkill /F /IM nginx.exe > nul'
}

function doRestart() {
    alert('restart nginx');
}

function refresh() {
    exec('tasklist|findstr /i "nginx.exe"', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        renderTable(stdout);
        console.log(stdout);
        console.log(`stderr: ${stderr}`);
    });
}

function renderTable(dataStr) {
    let data = dataStr ? dataStr.split('\n') : [];
    data = data.filter(function (item) {
        return item;
    });
    console.log(data);
    let html = '';
    data.forEach(function (item) {
        html += `<tr><td><pre>${item}</pre></td></tr>`;
    });
    let tbody = document.querySelector('table>tbody');
    tbody.innerHTML = html;
}

function getNginxPath() {
    fs.writeFile('conf/message.json', 'Hello Node.js', 'utf8', function (err) {

    });
}

function setNginxPath() {
    dialog.showOpenDialog({
        title: '请选择 nginx.exe 路径：',
        properties: ['openFile'],
        filters: [{
                name: '可执行文件',
                extensions: ['exe']
            },
            {
                name: '所有文件',
                extensions: ['*']
            }
        ],
        callback: function (filePaths) {
            console.log(filePaths);
        }
    })
}

// ------------------------------

init();

/*
nginx version: nginx/1.7.12
Usage: nginx [-?hvVtq] [-s signal] [-c filename] [-p prefix] [-g directives]

Options:
  -?,-h         : this help
  -v            : show version and exit
  -V            : show version and configure options then exit
  -t            : test configuration and exit
  -q            : suppress non-error messages during configuration testing
  -s signal     : send signal to a master process: stop, quit, reopen, reload
  -p prefix     : set prefix path (default: NONE)
  -c filename   : set configuration file (default: conf/nginx.conf)
  -g directives : set global directives out of configuration file
*/