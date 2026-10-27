// DTO (Data Transfer Object) para exponer únicamente los datos no sensibles del usuario en el token JWT.
export default class UserDTO {
    static getUserTokenFrom = (user) => {
        return {
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            email: user.email
        };
    };
}
