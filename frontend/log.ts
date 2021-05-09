document.body.insertAdjacentHTML('beforeend', `<section id="log-section"><div id="log"></div></section>`)
const logElement = document.getElementById('log')

const log = (msg: string) => {
    logElement.insertAdjacentHTML('beforeend', `<p>${msg}</p>`)
}

export default log