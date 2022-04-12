const socket = io()

const consoleOutput = []
const payloads = []

const pages = {
    cout: `
        <div id="cout-output"></div>
    `,
    reqs: `
        <div id="reqs-output"></div>
    `,
    routes: ``
}

function setMainContent (namespace) {
    const navElement = $$(`#nav-${namespace}`)
    $$('nav ul li').removeClass('active')    
    navElement.addClass('active')

    $$('main').inner(pages[namespace])

    if (namespace === 'cout') {
        updateCout()
    }

    if (namespace === 'reqs') {
        updateReqs()
    }
}

function genOut (data, type) {
    let f = ''

    for (let dataTile of data) {
        if (typeof dataTile === 'string') {
            f += `<span class="log-string">${dataTile.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
        } else if (typeof dataTile === 'object') {
            f += `<span class="log-object">${JSON.stringify(dataTile).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
        } else if (typeof dataTile === 'number') {
            f += `<span class="log-number">${dataTile.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
        } else if (typeof dataTile === 'boolean') {
            f += `<span class="log-boolean">${dataTile.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
        } else if (typeof dataTile === 'function') {
            f += `<span class="function">${dataTile.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
        } else if (typeof dataTile === 'undefined') {
            f += `<span class="log-undefined">undefined</span>`
        } else {
            f += `${dataTile.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')}`
        }

        f += ' '
    }

    return f
}

function formatDate (date) {
    // returns: '1:00:00'
    // or: '22:00:00'

    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()

    // Make sure the hours are two digits.
    const hoursString = hours < 10 ? '0' + hours : hours
    // Make sure the minutes are two digits.
    const minutesString = minutes < 10 ? '0' + minutes : minutes
    // Make sure the seconds are two digits.
    const secondsString = seconds < 10 ? '0' + seconds : seconds

    return `${hoursString}:${minutesString}:${secondsString}`
}

function objectToList (obj) {
    // Generate HTML Table from object (<table></table>)
    let html = '<table>'

    for (const prop in obj) {
        html += `<tr><td>${prop}</td><td>${obj[prop]}</td></tr>`
    }

    html += '</table>'

    return html
}

function updateReqs () {

    const genSessionDiv = (session) => {
        return `
            <div class="session">
                <h4>Session:</h4>
                ${objectToList(session)}
            </div>
        `
    }

    let finalHTML = ''

    for (const payload of payloads) {
        let reqHTML = `
            <h3 title="Click to show more info" class="req-title" onclick="$$(this.parentElement.querySelector('.req-more-info')).toggleClass('visible')"><span class="req-method">${payload.method}</span> ${payload.fullUrl}</h3>
            <div class="req-more-info">
                <div class="req-info">
                    <h4>Info:</h4>
                    <ul>
                        <li>At: <span class="req-prop-value">${formatDate(new Date(payload.timestamp))}</span></li>
                        <li>From: <span class="req-prop-value">${payload.ip}</span></li>
                        <li>User Agent: <span class="req-prop-value">${payload.headers['user-agent'].replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span></li>
                        <li>Status: <span class="req-prop-value">${payload.response.statusCode}</span></li>
                    </ul>
                </div>
                <div class="req-body">
                    <h4>Body:</h4>
                    <pre>${payload.body ? payload.body.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '<span class="none">none</span>'}</pre>
                </div>
                <div class="req-headers">
                    <h4>Headers:</h4>
                    ${objectToList(payload.headers)}
                </div>
                <div class="req-params">
                    <h4>Params:</h4>
                    ${objectToList(payload.params)}
                </div>
                ${payload.session ? genSessionDiv(payload.session) : ''}
                <div class="res-headers">
                    <h4>Response Headers:</h4>
                    ${objectToList(payload.response.headers)}
                </div>
            </div>
        `

        finalHTML += `<div class="req-container">${reqHTML}</div><br><hr><br>`
    }

    finalHTML += ''

    $$('#reqs-output').inner(finalHTML)

}

function updateCout () {
    const finalOutput = []

    for (const output of consoleOutput) {
        const type = output.type
        const stacklines = output.stack.split('\n')
        stacklines.shift()
        stacklines.shift()
        const stack = stacklines.join('\n')

        if (type === 'log') {
            const out = genOut(output.args, 'log')
            finalOutput.push(`<span title="${stack}" class="log">[ i ] [${formatDate(new Date(output.at))}] <span class="____out${output.__isFunc ? ' log-func' : ''}${output.__isErr ? ' log-errrrr' : ''}">${out}</span></span>`)
        } else if (type === 'warn') {
            const out = genOut(output.args, 'warn')
            finalOutput.push(`<span title="${stack}" class="warn">[ ! ] [${formatDate(new Date(output.at))}] <span class="____out${output.__isFunc ? ' log-func' : ''}${output.__isErr ? ' log-errrrr' : ''}">${out}</span></span>`)
        } else if (type === 'error') {
            const out = genOut(output.args, 'error')
            finalOutput.push(`<span title="${stack}" class="error">[ X ] [${formatDate(new Date(output.at))}] <span class="____out${output.__isFunc ? ' log-func' : ''}${output.__isErr ? ' log-errrrr' : ''}">${out}</span></span>`)
        }
    }

    $$('#cout-output').inner(finalOutput.join('<br>'))
}

$$(document)(() => {
    // Console Output
    socket.on('console.log-output', (data) => {
        consoleOutput.push({
            type: 'log',
            at: data.at,
            args: data.args,
            stack: data.stack,
            __isFunc: data.__isFunc,
            __isErr: data.__isErr
        })
        updateCout()
    })

    socket.on('console.warn-output', (data) => {
        consoleOutput.push({
            type: 'warn',
            at: data.at,
            args: data.args,
            stack: data.stack,
            __isFunc: data.__isFunc,
            __isErr: data.__isErr
        })
        updateCout()
    })

    socket.on('console.error-output', (data) => {
        consoleOutput.push({
            type: 'error',
            at: data.at,
            args: data.args,
            stack: data.stack,
            __isFunc: data.__isFunc,
            __isErr: data.__isErr
        })
        updateCout()
    })

    // Requests
    socket.on('new-request', (payload) => {
        payloads.push(payload)
        updateReqs()
    })

    // Tab Switcher
    const main = $$('main')
    
    $$('#nav-cout').on('click', () => {
        setMainContent('cout')
    })

    $$('#nav-reqs').on('click', () => {
        setMainContent('reqs')
    })

    $$('#nav-routes').on('click', () => {
        setMainContent('routes')
    })

    setMainContent('cout')
})