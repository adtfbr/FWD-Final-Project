import Swal from 'sweetalert2';

// Notifikasi Sukses (Pojok Kanan Atas)
export const showSuccessToast = (message) => {
  Swal.fire({
    icon: 'success',
    title: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

// Notifikasi Error (Pojok Kanan Atas)
export const showErrorToast = (message) => {
  Swal.fire({
    icon: 'error',
    title: message,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

// Konfirmasi Hapus (Tengah Layar)
export const showDeleteConfirmation = async (text = "Data yang dihapus tidak dapat dikembalikan!") => {
  return Swal.fire({
    title: 'Apakah Anda yakin?',
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  });
};