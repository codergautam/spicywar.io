class RoomList {
  constructor() {
    this.rooms = {};
  }

  getAllRooms() {
    return Object.values(this.rooms);
  }

  getRoom(id) {
    return this.rooms[id];
  }

  setRoom(room) {
    this.rooms[room.id] = room;
  }

  removeRoom(id) {
    delete this.rooms[id];
  }

  getRoomByPlayerId(id) {
    for (var room in this.rooms) {
      if (this.rooms[room].players.has(id)) {
        return this.rooms[room];
      }
    }
    return null;
  }
  
  tickAll() {
    for (var room in this.rooms) {
      this.rooms[room].tick();
    }
  }
}

const list = new RoomList();

module.exports = list;
