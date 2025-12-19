/*
  Warnings:

  - You are about to drop the column `cliente_id` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_hora` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `mascota_id` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `motivo` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `servicio_id` on the `citas` table. All the data in the column will be lost.
  - You are about to drop the column `veterinario_id` on the `citas` table. All the data in the column will be lost.
  - You are about to alter the column `estado` on the `citas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `nombre` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `apellido` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `email` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `telefono` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `direccion` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `rut` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.
  - You are about to drop the column `fecha` on the `historiales_medicos` table. All the data in the column will be lost.
  - You are about to drop the column `mascota_id` on the `historiales_medicos` table. All the data in the column will be lost.
  - You are about to drop the column `veterinario_nombre` on the `historiales_medicos` table. All the data in the column will be lost.
  - You are about to alter the column `peso_actual` on the `historiales_medicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `temperatura` on the `historiales_medicos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(4,1)`.
  - You are about to drop the column `cliente_id` on the `mascotas` table. All the data in the column will be lost.
  - You are about to alter the column `nombre` on the `mascotas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `especie` on the `mascotas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `raza` on the `mascotas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `sexo` on the `mascotas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `color` on the `mascotas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.
  - You are about to alter the column `peso_kg` on the `mascotas` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to drop the column `duracion` on the `servicios` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `servicios` table. All the data in the column will be lost.
  - You are about to alter the column `nombre` on the `servicios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `nombre` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `apellido` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `email` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `password_hash` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `rut` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.
  - You are about to alter the column `telefono` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to drop the `sesiones` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fecha_cita` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hora_cita` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cliente` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_mascota` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_servicio` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_servicio` to the `citas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cita` to the `historiales_medicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_mascota` to the `historiales_medicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_veterinario` to the `historiales_medicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sintomas` to the `historiales_medicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_cliente` to the `mascotas` table without a default value. This is not possible if the table is not empty.
  - Made the column `fecha_nacimiento` on table `mascotas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `peso_kg` on table `mascotas` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `categoria` to the `servicios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duracion_minutos` to the `servicios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_base` to the `servicios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rol` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."citas" DROP CONSTRAINT "citas_mascota_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."citas" DROP CONSTRAINT "citas_servicio_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."historiales_medicos" DROP CONSTRAINT "historiales_medicos_mascota_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."mascotas" DROP CONSTRAINT "mascotas_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."sesiones" DROP CONSTRAINT "sesiones_usuario_id_fkey";

-- AlterTable
ALTER TABLE "public"."citas" DROP COLUMN "cliente_id",
DROP COLUMN "fecha_hora",
DROP COLUMN "mascota_id",
DROP COLUMN "motivo",
DROP COLUMN "precio",
DROP COLUMN "servicio_id",
DROP COLUMN "veterinario_id",
ADD COLUMN     "fecha_cita" DATE NOT NULL,
ADD COLUMN     "fecha_creacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_modificacion" TIMESTAMP,
ADD COLUMN     "hora_cita" TIME NOT NULL,
ADD COLUMN     "id_cliente" INTEGER NOT NULL,
ADD COLUMN     "id_mascota" INTEGER NOT NULL,
ADD COLUMN     "id_servicio" INTEGER NOT NULL,
ADD COLUMN     "id_veterinario" INTEGER,
ADD COLUMN     "motivo_consulta" TEXT,
ADD COLUMN     "precio_servicio" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "estado" DROP DEFAULT,
ALTER COLUMN "estado" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "public"."clientes" ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "apellido" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "telefono" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "direccion" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "rut" SET DATA TYPE VARCHAR(12);

-- AlterTable
ALTER TABLE "public"."historiales_medicos" DROP COLUMN "fecha",
DROP COLUMN "mascota_id",
DROP COLUMN "veterinario_nombre",
ADD COLUMN     "fecha_atencion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_creacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_cita" INTEGER NOT NULL,
ADD COLUMN     "id_mascota" INTEGER NOT NULL,
ADD COLUMN     "id_veterinario" INTEGER NOT NULL,
ADD COLUMN     "medicamentos" TEXT,
ADD COLUMN     "proxima_cita" DATE,
ADD COLUMN     "recomendaciones" TEXT,
ADD COLUMN     "sintomas" TEXT NOT NULL,
ALTER COLUMN "peso_actual" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "temperatura" SET DATA TYPE DECIMAL(4,1);

-- AlterTable
ALTER TABLE "public"."mascotas" DROP COLUMN "cliente_id",
ADD COLUMN     "foto_url" TEXT,
ADD COLUMN     "id_cliente" INTEGER NOT NULL,
ADD COLUMN     "microchip" VARCHAR(20),
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "especie" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "raza" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "sexo" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(30),
ALTER COLUMN "fecha_nacimiento" SET NOT NULL,
ALTER COLUMN "fecha_nacimiento" SET DATA TYPE DATE,
ALTER COLUMN "peso_kg" SET NOT NULL,
ALTER COLUMN "peso_kg" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."servicios" DROP COLUMN "duracion",
DROP COLUMN "precio",
ADD COLUMN     "categoria" VARCHAR(50) NOT NULL,
ADD COLUMN     "duracion_minutos" INTEGER NOT NULL,
ADD COLUMN     "fecha_creacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "precio_base" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "rol" VARCHAR(20) NOT NULL,
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "apellido" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "password_hash" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "rut" SET DATA TYPE VARCHAR(12),
ALTER COLUMN "telefono" SET DATA TYPE VARCHAR(15);

-- DropTable
DROP TABLE "public"."sesiones";

-- CreateTable
CREATE TABLE "public"."productos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "categoria" VARCHAR(50) NOT NULL,
    "marca" VARCHAR(50),
    "unidad_medida" VARCHAR(20) NOT NULL,
    "precio_compra" DECIMAL(10,2) NOT NULL,
    "precio_venta" DECIMAL(10,2) NOT NULL,
    "stock_minimo" INTEGER NOT NULL,
    "stock_actual" INTEGER NOT NULL,
    "fecha_vencimiento" DATE,
    "lote" VARCHAR(50),
    "proveedor" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facturas" (
    "id" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "numero_factura" VARCHAR(20) NOT NULL,
    "fecha_emision" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "iva" DECIMAL(10,2) NOT NULL,
    "impuestos" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "estado_pago" VARCHAR(20) NOT NULL,
    "metodo_pago" VARCHAR(20) NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detalle_facturas" (
    "id" SERIAL NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_servicio" INTEGER,
    "descripcion" VARCHAR(200) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pagos" (
    "id" SERIAL NOT NULL,
    "id_factura" INTEGER NOT NULL,
    "numero_transaccion" VARCHAR(100),
    "metodo_pago" VARCHAR(20) NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "estado" VARCHAR(20) NOT NULL,
    "fecha_pago" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprobante_url" TEXT,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventario_movimientos" (
    "id" SERIAL NOT NULL,
    "id_producto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo_movimiento" VARCHAR(20) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" VARCHAR(200),
    "precio_unitario" DECIMAL(10,2),
    "referencia_id" INTEGER,
    "referencia_tipo" VARCHAR(20),
    "stock_anterior" INTEGER NOT NULL,
    "stock_nuevo" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_movimientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numero_factura_key" ON "public"."facturas"("numero_factura");

-- AddForeignKey
ALTER TABLE "public"."mascotas" ADD CONSTRAINT "mascotas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "public"."mascotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "public"."servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."citas" ADD CONSTRAINT "citas_id_veterinario_fkey" FOREIGN KEY ("id_veterinario") REFERENCES "public"."usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historiales_medicos" ADD CONSTRAINT "historiales_medicos_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "public"."mascotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historiales_medicos" ADD CONSTRAINT "historiales_medicos_id_cita_fkey" FOREIGN KEY ("id_cita") REFERENCES "public"."citas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."historiales_medicos" ADD CONSTRAINT "historiales_medicos_id_veterinario_fkey" FOREIGN KEY ("id_veterinario") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."facturas" ADD CONSTRAINT "facturas_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "public"."clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_facturas" ADD CONSTRAINT "detalle_facturas_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detalle_facturas" ADD CONSTRAINT "detalle_facturas_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pagos" ADD CONSTRAINT "pagos_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventario_movimientos" ADD CONSTRAINT "inventario_movimientos_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventario_movimientos" ADD CONSTRAINT "inventario_movimientos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
