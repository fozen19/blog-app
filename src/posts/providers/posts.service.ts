import { Body, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/tags/tag.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly usersService: UsersService,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    @InjectRepository(MetaOption)
    private readonly metaOptionsRepository: Repository<MetaOption>,

    private readonly tagsService: TagsService,
  ) {}
  public async findAll(userId: string) {
    const posts = await this.postsRepository.find({
      relations: {
        metaOptions: true,
        author: true,
        tags: true,
      },
    });

    return posts;
  }
  public async create(@Body() createPostDto: CreatePostDto) {
    // Create metaOptions
    // Create post
    const author = await this.usersService.findOneById(createPostDto.authorId);
    const tags = await this.tagsService.findMultipleTags(
      createPostDto.tags ?? [],
    );
    if (author) {
      const post = this.postsRepository.create({
        ...createPostDto,
        author: author,
        tags: tags,
      });
      return await this.postsRepository.save(post);
    }
    return null;
    // Add metaOptions to the post
    // return the post
  }
  public async update(patchPostDto: PatchPostDto){
    const tags = await this.tagsService.findMultipleTags(
      patchPostDto?.tags ?? [],
    );

    const post = await this.postsRepository.findOneBy({
      id: patchPostDto.id,
    });
    if (post) {
      post.title = patchPostDto.title ?? post?.title ?? '';
      post.content = patchPostDto.content ?? post?.content ?? '';
      post.status = patchPostDto.status ?? post?.status;
      post.postType = patchPostDto.postType ?? post?.postType;
      post.slug = patchPostDto.slug ?? post?.slug;
      post.featuredImageUrl =
        patchPostDto.featuredImageUrl ?? post?.featuredImageUrl;
      post.publishOn = patchPostDto.publishOn ?? post?.publishOn;
      post.tags = tags;
      return await this.postsRepository.save(post);
    }
    return new Post();
  }
  public async delete(id: number) {
    // Find the post
    await this.postsRepository.delete(id);

    return { deleted: true, id };
  }
}
