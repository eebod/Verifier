const modal = document.getElementById('thankYouModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const meetMeBtn = document.getElementById('meetMeBtn');
const sendCodeBtn = document.getElementById('sendCodeBtn');
const submitCodeBtn = document.getElementById('submitCodeBtn');
const emailInput = document.getElementById('email');
const codeInputs = document.querySelectorAll('.code-input');

document.addEventListener('DOMContentLoaded', function() {
    let countdown = 0;
    let timer;

    // Disable form entry on load
    sendCodeBtn.disabled = true;

    // Email input validation
    emailInput.addEventListener('input', function() {
        sendCodeBtn.disabled = !this.value;
    });

    // Handle send code button and countdown
    sendCodeBtn.addEventListener('click', async function(e) {
        e.preventDefault();

        const email = emailInput.value;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
           return displayMessage('Invalid email format', false, 3000);
        }

        if (email && countdown === 0) {
            sendCodeBtn.textContent = 'sending...';
            const response = await reqCode(email);
            if(!response){
                sendCodeBtn.textContent = 'send code';
                return displayMessage('An error occured, please try again!', false, 5000)
            }

            if(!response.sts){
                sendCodeBtn.textContent = 'send code';
                return displayMessage(response.msg, false, 5000);
            }

            countdown = 60;
            sendCodeBtn.disabled = true;
            timer = setInterval(() => {
                countdown--;
                sendCodeBtn.textContent = `${countdown}s`;
                
                if (countdown === 0) {
                    clearInterval(timer);
                    sendCodeBtn.textContent = 'send code';
                    sendCodeBtn.disabled = false;
                }
            }, 1000);

            displayMessage(response.msg, true, 5000);
            codeInputs[0].focus(); // Send focus to the first code input
        }
    });

    // Handle code inputs
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Allow only numbers
            this.value = this.value.replace(/[^0-9]/g, '');

            // Move to next input if value is entered
            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }

            // Check if all inputs are filled
            const isComplete = Array.from(codeInputs).every(input => input.value.length === 1);
            submitCodeBtn.disabled = !isComplete;
            isComplete ? submitCodeBtn.focus() : '';
        });

        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    // Handle submit code button
    submitCodeBtn.addEventListener('click', async function(e) {
        e.preventDefault();

        submitCodeBtn.textContent = 'Verifying...'
        const code = Array.from(codeInputs).map(input => input.value).join('');
        if (code.length === 6) {
            const response = await verifyCode({code, email: emailInput.value});
            if(!response){
                submitCodeBtn.textContent = 'submit code';
                return displayMessage('An error occured, please try again!', false, 5000)
            }

            if(!response.sts){
                submitCodeBtn.textContent = 'submit code';
                return displayMessage(response.msg, false, 3500);
            }

            displayMessage(response.msg, true, 3500);
            submitCodeBtn.textContent = 'Verified '
            setTimeout(()=> {
                submitCodeBtn.textContent = 'submit code'
            }, 3500);

            // Reset form
            emailInput.value = '';
            codeInputs.forEach((input) => {
                input.value = '';
            });
            submitCodeBtn.disabled = true;

            setTimeout(()=>{
                showModal();
            }, 4500)
        }
    });


    // Event listeners
    closeModalBtn.addEventListener('click', hideModal);
    meetMeBtn.addEventListener('click', () => {
        window.open("https://www.ebode.dev", '_blank');
        hideModal();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Close modal on escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            hideModal();
        }
    });
});

function displayMessage(message, isSuccess, timer) {
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.textContent = message;
    messageContainer.className = `fixed left-1/2 transform -translate-x-1/2 p-4 text-center z-50 ${isSuccess ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} text-black border-l-4 shadow-md`;
    messageContainer.style.top = '20px';
    messageContainer.style.width = '300px';

    // Append message container to body
    document.body.appendChild(messageContainer);

    // Remove message after specified time
    setTimeout(() => {
        document.body.removeChild(messageContainer);
    }, timer);
}


async function reqCode(email){
    try {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        };
    
        const response = await fetch("https://api.ebode.dev/verifier/requestCode", requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        return false
    }
}

async function verifyCode({email, code}){
    try {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code }),
        };
    
        const response = await fetch("https://api.ebode.dev/verifier/verifyCode", requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        return false
    }
}


// Function to show modal
function showModal() {
    modal.classList.remove('hidden');
    modal.children[0].classList.add('scale-100');
    modal.children[0].classList.remove('scale-95');
}

// Function to hide modal
function hideModal() {
    modal.classList.add('hidden');
    modal.children[0].classList.add('scale-95');
    modal.children[0].classList.remove('scale-100');
}