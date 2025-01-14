#pragma once

#include <SDL3/SDL.h>
#include <stdbool.h>

#define MODELS \
    X(GRASS, 0) \
    X(GRASS_BLUE, 0x0000FF00 | 100) \
    X(GRASS_GREEN, 0x00FF0000 | 100) \
    X(GRASS_RED, 0xFF000000 | 100) \
    X(ROCK1, 0) \
    X(ROCK2, 0) \
    X(ROCK3, 0) \
    X(ROCK4, 0) \
    X(ROCK5, 0) \
    X(ROCK_BLUE, 0x0000FF00 | 100) \
    X(ROCK_GREEN, 0x00FF0000 | 100) \
    X(ROCK_RED, 0xFF000000 | 100) \
    X(TREE1, 0) \
    X(TREE2, 0) \
    X(TREE3, 0) \

typedef enum
{
#define X(name, color) MODEL_##name,
    MODELS
#undef X
    MODEL_COUNT,
}
model_t;

bool model_init(
    SDL_GPUDevice* device);
void model_free(
    SDL_GPUDevice* device);
SDL_GPUBuffer* model_get_vbo(
    const model_t model);
SDL_GPUBuffer* model_get_ibo(
    const model_t model);
SDL_GPUTexture* model_get_palette(
    const model_t model);
int model_get_num_vertices(
    const model_t model);
int model_get_num_indices(
    const model_t model);
int model_get_height(
    const model_t model);
int model_get_intensity(
    const model_t model);
int model_get_red(
    const model_t model);
int model_get_green(
    const model_t model);
int model_get_blue(
    const model_t model);
const char* model_get_string(
    const model_t model);