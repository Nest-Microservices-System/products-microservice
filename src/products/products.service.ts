import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma.service';
import { PaginationDto } from 'src/common/dto';

@Injectable()
export class ProductsService {

  constructor(private prisma: PrismaService) {

  }
  async create(createProductDto: CreateProductDto) {

    const product = await this.prisma.product.create({
      data: createProductDto
    });

    return product
  }

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;

    const totalRecords = await this.prisma.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalRecords / limit);

    const skip = (page - 1) * limit;

    return {
      data: await this.prisma.product.findMany(({
        skip,
        take: limit,
        where: {
          available: true
        }
      })),
      metadata: {
        total: totalRecords,
        page,
        lastPage
      }

    }

  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, name, price } = updateProductDto;

    if (!name && !price) throw new BadRequestException('No data to update');

    const product = await this.findOne(id);

    return await this.prisma.product.update({
      where: { id },
      data: {
        name: name ? name : product.name,
        price: price ? price : product.price
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const deletedProduct = await this.prisma.product.update({
      where: { id },
      data: { available: false }
    });

    // await this.prisma.product.delete({
    //   where: { id }
    // });

    return
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, available: true }
    });

    if (!product) throw new NotFoundException(`Product was not found`);

    return product;
  }
}
