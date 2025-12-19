-- DropForeignKey
ALTER TABLE "public"."detalle_facturas" DROP CONSTRAINT "detalle_facturas_id_producto_fkey";

-- DropForeignKey
ALTER TABLE "public"."pagos" DROP CONSTRAINT "pagos_id_factura_fkey";

-- AlterTable
ALTER TABLE "public"."detalle_facturas" ALTER COLUMN "id_producto" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."pagos" ALTER COLUMN "id_factura" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."detalle_facturas" ADD CONSTRAINT "detalle_facturas_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "public"."productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pagos" ADD CONSTRAINT "pagos_id_factura_fkey" FOREIGN KEY ("id_factura") REFERENCES "public"."facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
