import {
  Sequelize,
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  ModelStatic,
} from "sequelize";

export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  static NAME: string = "user_model";
  id!: string;
  email!: string;
  password!: string;

  static define(sequelize: Sequelize): ModelStatic<UserModel> {
    return sequelize.define<UserModel>(this.NAME, {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
    });
  }
}
