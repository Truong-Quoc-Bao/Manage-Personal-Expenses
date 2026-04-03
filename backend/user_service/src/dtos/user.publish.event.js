const { USER_STATUS } = require('../types/user.types');

class UserPublishStatusEvent {
  constructor(user, status) {
    this.UserId = user.user_id;
    this.Email = user.email;
    const allowedStatuses = Object.values(USER_STATUS);
    
    if (!allowedStatuses.includes(status)) {
        this.Status = USER_STATUS.PENDING;
    } else {
        this.Status = status;
    }

    Object.freeze(this);
  }
}

module.exports = { UserPublishStatusEvent };