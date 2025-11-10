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

// Helpers de i18n
function t(key) {
	if (window.LanguageSystem && typeof window.LanguageSystem.getText === 'function') {
		return window.LanguageSystem.getText(key);
	}
	return key;
}

function showAdminResponse(data) {
	// Preferir código del backend si existe
	if (data && data.code) {
		const key = 'admin-' + data.code; // p.ej. admin-delete-success
		alert(t(key));
		return;
	}
	// Fallback: mapear por mensaje devuelto (en español) a claves conocidas
	const raw = (data && (data.message || data.error)) || '';
	const map = {
		'Usuario baneado correctamente': 'admin-delete-success',
		'No se pudo banear el usuario': 'admin-delete-fail',
		'Puntaje vaciado correctamente': 'admin-reset-score-success',
		'No se pudo vaciar el puntaje': 'admin-reset-score-fail',
		'Monedas vaciadas correctamente': 'admin-reset-money-success',
		'No se pudo vaciar las monedas': 'admin-reset-money-fail',
		'Acción no válida': 'admin-invalid-action',
		'ID de usuario no válido': 'admin-invalid-user-id',
		'No puedes modificar al usuario administrador': 'admin-protected-user'
	};
	const key = map[raw];
	alert(key ? t(key) : raw || t('generic-error'));
}

// Botones
const btns = document.querySelectorAll('.container-admin-buttons .btn-danger');

// Eliminar usuario
btns[0].addEventListener('click', function() {
	const id_user = getSelectedUserId();
	if (!id_user) { alert(t('admin-select-user-first')); return; }
	if (!confirm(t('admin-confirm-delete'))) return;
	fetch('admin-mode.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action: 'delete', id_user })
	}).then(res => res.json()).then(data => {
		showAdminResponse(data);
		location.reload();
	}).catch(() => alert(t('generic-error')));
});

// Vaciar puntaje
btns[1].addEventListener('click', function() {
	const id_user = getSelectedUserId();
	if (!id_user) { alert(t('admin-select-user-first')); return; }
	fetch('admin-mode.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action: 'reset_score', id_user })
	}).then(res => res.json()).then(data => {
		showAdminResponse(data);
		location.reload();
	}).catch(() => alert(t('generic-error')));
});

// Vaciar monedas
btns[2].addEventListener('click', function() {
	const id_user = getSelectedUserId();
	if (!id_user) { alert(t('admin-select-user-first')); return; }
	fetch('admin-mode.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action: 'reset_money', id_user })
	}).then(res => res.json()).then(data => {
		showAdminResponse(data);
		location.reload();
	}).catch(() => alert(t('generic-error')));
});
