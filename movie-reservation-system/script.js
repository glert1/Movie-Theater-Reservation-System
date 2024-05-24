document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const adminControls = document.getElementById('adminControls');
    const userControls = document.getElementById('userControls');
    const setSeatsButton = document.getElementById('setSeats');
    const seating = document.getElementById('seating');
    const resName = document.getElementById('resName');
    const resSurname = document.getElementById('resSurname');
    const resSeats = document.getElementById('resSeats');
    const resPrice = document.getElementById('resPrice');
    const confirmReservation = document.getElementById('confirmReservation');

    let currentUser = null;
    let seatMatrix = [];
    let selectedSeats = [];

    userForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData.entries());

        currentUser = {
            ...userData,
            age: parseInt(userData.age, 10),
            role: userData.email === 'admin@admin.com' ? 'admin' : 'user',
            ticketPrice: calculatePrice(parseInt(userData.age, 10))
        };

        updateUserDetails();
        toggleControls(currentUser.role === 'admin');
    });

    setSeatsButton.addEventListener('click', () => {
        const rows = parseInt(document.getElementById('rows').value, 10);
        const columns = parseInt(document.getElementById('columns').value, 10);

        if (rows > 0 && columns > 0) {
            generateSeating(rows, columns);
            userControls.classList.remove('hidden');
        } else {
            alert('Please enter valid rows and columns.');
        }
    });

    seating.addEventListener('click', (event) => {
        if (event.target.classList.contains('seat') && !event.target.classList.contains('reserved')) {
            toggleSeatSelection(event.target);
        }
    });

    confirmReservation.addEventListener('click', () => {
        confirmReservationHandler();
    });

    function calculatePrice(age) {
        if (age < 18 || age >= 65) return 10;
        if (age < 26) return 15;
        return 25;
    }

    function generateSeating(rows, columns) {
        seatMatrix = Array.from({ length: rows }, () => Array(columns).fill(false));
        seating.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        seating.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        seating.innerHTML = '';

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const seat = document.createElement('div');
                seat.classList.add('seat', 'tooltip');
                seat.dataset.row = row;
                seat.dataset.col = col;
                seat.textContent = `${String.fromCharCode(65 + row)}${col + 1}`;
                seating.appendChild(seat);
            }
        }
    }

    function updateUserDetails() {
        resName.textContent = currentUser.name;
        resSurname.textContent = currentUser.surname;
    }

    function updateReservationDetails() {
        resSeats.textContent = selectedSeats.map(s => s.label).join(', ') || 'None';
        resPrice.textContent = selectedSeats.length * currentUser.ticketPrice;
    }

    function toggleControls(isAdmin) {
        if (isAdmin) {
            adminControls.classList.remove('hidden');
            userControls.classList.add('hidden');
        } else {
            userControls.classList.toggle('hidden', seatMatrix.length === 0);
            adminControls.classList.add('hidden');
        }
        document.querySelector('.right').classList.remove('hidden');
    }

    function toggleSeatSelection(seat) {
        const row = seat.dataset.row;
        const col = seat.dataset.col;
        if (seat.classList.contains('selected')) {
            seat.classList.remove('selected');
            selectedSeats = selectedSeats.filter(s => s.row !== row || s.col !== col);
        } else {
            seat.classList.add('selected');
            selectedSeats.push({ row, col, label: seat.textContent });
        }
        updateReservationDetails();
    }

    function confirmReservationHandler() {
        const seatLabels = selectedSeats.map(s => s.label).join(', ');
        const totalPrice = selectedSeats.length * currentUser.ticketPrice;
        const confirmationMessage = `Dear ${currentUser.name} ${currentUser.surname},\nSeats: ${seatLabels}\nTotal amount is $${totalPrice}.\nWould you like to complete your purchase?`;

        if (confirm(confirmationMessage)) {
            selectedSeats.forEach(seat => {
                const seatElement = document.querySelector(`.seat[data-row="${seat.row}"][data-col="${seat.col}"]`);
                if (seatElement) {
                    seatElement.classList.add('reserved');
                    seatElement.classList.remove('selected');
                }
            });
            alert(`Reservation confirmed for ${currentUser.name} ${currentUser.surname}. Seats: ${seatLabels}. Total price: $${totalPrice}`);
            selectedSeats = [];
            updateReservationDetails();
        } else {
            alert('Reservation cancelled.');
        }
    }
});
