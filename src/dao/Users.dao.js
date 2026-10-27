import userModel from './models/User.js';

// DAO (Data Access Object) para la colección Users en MongoDB.
export default class Users {

    get = (params) => {
        return userModel.find(params);
    };

    getBy = (params) => {
        return userModel.findOne(params);
    };

    save = (doc) => {
        return userModel.create(doc);
    };

    update = (id, doc) => {
        return userModel.findByIdAndUpdate(id, { $set: doc });
    };

    delete = (id) => {
        return userModel.findByIdAndDelete(id);
    };
}
