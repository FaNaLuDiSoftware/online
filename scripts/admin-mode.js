// Selección y acciones de administración para la tabla de usuarios
let selectedRow = null;
document.querySelectorAll('.table tbody tr').forEach(row => {
	row.addEventListener('click', function() {
		if (selectedRow) selectedRow.classList.remove('table-primary');
		selectedRow = this;
		selectedRow.classList.add('table-primary');
	});
});

function getSelectedUserId() {
	return selectedRow ? parseInt(selectedRow.cells[0].textContent.trim(), 10) : null;
}

// Botones
const btns = document.querySelectorAll('.container-admin-buttons .btn-danger');

// Eliminar usuario
btns[0].addEventListener('click', function() {
	const id_user = getSelectedUserId();
	if (!id_user) { alert('Selecciona un usuario primero'); return; }
	if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
	fetch('admin-mode.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action: 'delete', id_user })
	}).then(res => res.json()).then(data => {
		alert(data.message || data.error);
		location.reload();
	});
});

// Vaciar puntaje
btns[1].addEventListener('click', function() {
	const id_user = getSelectedUserId();
	if (!id_user) { alert('Selecciona un usuario primero'); return; }
	fetch('admin-mode.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action: 'reset_score', id_user })
	}).then(res => res.json()).then(data => {
		alert(data.message || data.error);
		location.reload();
	});
});

// Vaciar monedas
btns[2].addEventListener('click', function() {
	const id_user = getSelectedUserId();
	if (!id_user) { alert('Selecciona un usuario primero'); return; }
	fetch('admin-mode.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action: 'reset_money', id_user })
	}).then(res => res.json()).then(data => {
		alert(data.message || data.error);
		location.reload();
	});
});
