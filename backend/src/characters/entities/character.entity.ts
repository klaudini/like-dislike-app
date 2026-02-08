import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CharacterDocument = Character & Document;

@Schema({
  timestamps: true,
  collection: "characters",
})
export class Character {
  @Prop({ required: true, unique: true })
  externalId: string;
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  image: string;

  @Prop({
    required: true,
    enum: ["rickandmorty", "pokemon", "superhero", "naruto"],
    index: true,
  })
  category: string;

  @Prop({ default: 0, min: 0 })
  likes: number;

  @Prop({ default: 0, min: 0 })
  dislikes: number;

  @Prop({ type: Date, default: Date.now })
  lastEvaluated: Date;

  @Prop({ type: Object })
  metadata: Record<string, any>; // Para guardar info adicional (especie, género, etc)
}

export const CharacterSchema = SchemaFactory.createForClass(Character);

// Índices compuestos para mejorar consultas
CharacterSchema.index({ category: 1, likes: -1 });
CharacterSchema.index({ category: 1, dislikes: -1 });
CharacterSchema.index({ lastEvaluated: -1 });

// Virtual para calcular total de votos
CharacterSchema.virtual("totalVotes").get(function () {
  return this.likes + this.dislikes;
});

// Virtual para calcular porcentaje de likes
CharacterSchema.virtual("likePercentage").get(function () {
  const total = this.likes + this.dislikes;
  return total > 0 ? Math.round((this.likes / total) * 100) : 0;
});

// Incluir virtuals en JSON y Object
CharacterSchema.set("toJSON", { virtuals: true });
CharacterSchema.set("toObject", { virtuals: true });
