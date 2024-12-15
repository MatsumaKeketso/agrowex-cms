export const Permissions = {
  om: {
    read: {
      offtake: {
        status: {
          inprogress: false,
          negotiation: false,
          planning: false,
          published: false,
          submitted: true,
          finalstage: true,
          active: true
        }
      }
    },
    write: {}
  },
  pm: {
    read: {
      offtake: {

        status: {
          inprogress: true,
          negotiation: true,
          planning: true,
          published: true,
          submitted: false,
          finalstage: false,
          active: false
        }
      }
    },
    write: {}
  },
  admin: {

  }
}