#version 450

#include "config.h"

struct t_light
{
    vec3 position;
    float padding;
    vec3 color;
    float intensity;
};

layout(location = 0) in vec2 i_uv;
layout(location = 0) out vec4 o_light;
layout(set = 2, binding = 0) uniform sampler2D s_position;
layout(set = 2, binding = 1) uniform sampler2D s_normal;
layout(set = 2, binding = 2) uniform sampler2D s_ray_position_front;
layout(set = 2, binding = 3) uniform sampler2D s_ray_position_back;
layout(set = 2, binding = 4) uniform sampler2D s_sun_depth;
layout(set = 2, binding = 5) buffer readonly t_lights
{
    t_light b_lights[];
};
layout(set = 3, binding = 0) uniform t_ray_matrix
{
    mat4 u_ray_matrix;
};
layout(set = 3, binding = 1) uniform t_sun_matrix
{
    mat4 u_sun_matrix;
};
layout(set = 3, binding = 2) uniform t_sun_direction
{
    vec3 u_sun_direction;
};
layout(set = 3, binding = 3) uniform t_num_lights
{
    uint u_num_lights;
};

float get_ray_light(
    const vec3 src,
    const vec3 dst,
    const vec3 normal,
    const float spread,
    const vec2 uv)
{
    if (src.y - 0.1f > dst.y && normal.y > 0.9f)
    {
        return 0.0f;
    }
    vec3 direction = dst - src;
    const float step1 = 1.0f;
    const vec2 step2 = step1 / vec2(textureSize(s_ray_position_front, 0));
    const float spread2 = length(direction.xz);
    const float spread3 = length(direction);
    direction = normalize(direction);
    if (spread2 > spread)
    {
        return 0.0f;
    }
    const float end2 = length(vec2(MODEL_SIZE, MODEL_SIZE)) / 2.0f;
    const float end3 = end2 * spread3 / spread2;
    if (spread2 < end2)
    {
        return 1.0f - spread2 / spread;
    }
    else if (normal.y < 0.1f && dot(direction.xz, normal.xz) < 0.0f)
    {
        return 0.0f;
    }
    const float angle = abs(dot(direction.xz, vec2(0.0f, 1.0f)));
    const float start = 2.0f + abs(angle - 0.5f) * 10.0f;
    vec2 i2 = start / step1 * step2;
    for (float i1 = start; i1 < spread3 - end3; i1 += step1, i2 += step2)
    {
        const vec3 position = src + direction * i1;
        vec2 ray_uv = uv + direction.xz * i2;
        const vec2 size = vec2(textureSize(s_ray_position_front, 0));
        ray_uv = floor(ray_uv * size) / size + (1.0f / size) * 0.5f;
        const vec3 ray_front = texture(s_ray_position_front, ray_uv).xyz;
        const vec3 ray_back = texture(s_ray_position_back, ray_uv).xyz;
        if (position.y > ray_back.y && position.y < ray_front.y)
        {
            return 0.0f;
        }
    }
    return 1.0f - spread2 / spread;
}

float get_sun_light(
    const vec3 position,
    const vec3 normal)
{
    const float sun = max(dot(u_sun_direction, -normal), 0.0f);
    if (sun <= 0.0f)
    {
        return 0.0f;
    }
    vec4 uv = u_sun_matrix * vec4(position, 1.0f);
    const float depth = uv.z;
    uv.xy = uv.xy * 0.5f + 0.5f;
    uv.y = 1.0f - uv.y;
    const float nearest = texture(s_sun_depth, uv.xy).x;
    return float(depth - 0.005f < nearest) / 2.0f;
}

void main()
{
    const vec3 position = texture(s_position, i_uv).xyz;
    const vec3 normal = texture(s_normal, i_uv).xyz;
    vec4 uv = u_ray_matrix * vec4(position, 1.0f);
    uv.xy = uv.xy * 0.5f + 0.5f;
    uv.y = 1.0f - uv.y;
    o_light = vec4(0.3f);
    o_light = max(o_light, vec4(get_sun_light(position, normal) / 3.0f));
    vec3 color = vec3(0.0f);
    float intensity = 0.0f;
    for (int i = 0; i < u_num_lights; i++)
    {
        const float light = get_ray_light(
            position,
            b_lights[i].position,
            normal,
            b_lights[i].intensity,
            uv.xy);
        if (light <= 0.0f)
        {
            continue;
        }
        color += b_lights[i].color / 255.0f * light;
        intensity += light;
    }
    if (intensity <= 0.0f)
    {
        return;
    }
    color /= intensity;
    o_light.rgb = mix(o_light.rgb, color, intensity);
    o_light.a += intensity;
}