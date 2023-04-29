import { Controller } from '@nestjs/common';
import { TextblocksService } from './textblocks.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateBlockData, UpdateBlockData } from './textblocks.model';

@Controller('textblocks')
export class TextblocksController {
    constructor(
        private textblockService: TextblocksService,
    ) {}
    
    @MessagePattern({ cmd: 'create-textblock' })
    async create(
        @Payload() textblockData: CreateBlockData

    ) {
        return await this.textblockService.create(textblockData); 
    }

    @MessagePattern({ cmd: 'update-textblock' })
    async update(
        @Payload() newTextblockData: UpdateBlockData

    ) {
        return await this.textblockService.updateBlock(newTextblockData); 
    }

    @MessagePattern({ cmd: 'get-all-textblocks' })
    async getAllTextblocks(
    ) {
        return await this.textblockService.getAllBlocks();
    }

    @MessagePattern({ cmd: 'delete-textblock' })
    async delete(
        @Payload() id
    ) {
        return await this.textblockService.deleteBlock(id); 
    }
}
