export const getRolePath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'landlord':
      return '/landlord/dashboard';
    case 'tenant':
      return '/tenant/dashboard';
    default:
      return '/role-selection';
  }
};
