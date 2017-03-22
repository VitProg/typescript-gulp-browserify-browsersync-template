
function hello(compiler: string) {
    let helloMessage = `Hello from ${compiler}`;
    let greetingElement = document.getElementById('greeting');
    greetingElement.innerText = helloMessage;
    console.log(helloMessage);
}

setTimeout(() => {
    hello("TypeScript");
}, 1000);