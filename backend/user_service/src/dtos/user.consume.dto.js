class UserCreateDto {
  constructor(user) {
    this.user_id = user.userId;
    this.user_name = user.userName;
    this.email = user.email;
    this.createAte = user.createAt;
  }
}

module.exports = { UserCreateDto };