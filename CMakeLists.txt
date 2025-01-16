cmake_minimum_required(VERSION 3.24)
project(2.5d_lighting)

set(BINARY_DIR ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${BINARY_DIR})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_RELEASE ${BINARY_DIR})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY_DEBUG ${BINARY_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${BINARY_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY_RELEASE ${BINARY_DIR})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY_DEBUG ${BINARY_DIR})
make_directory(${BINARY_DIR})

add_subdirectory(lib/SDL)
add_executable(2.5d_lighting WIN32
    lib/SPIRV-Reflect/spirv_reflect.c
    lib/sqlite3/sqlite3.c
    lib/stb/stb.c
    lib/tinyobjloader-c/tinyobj_loader_c.c
    src/camera.c
    src/database.c
    src/helpers.c
    src/main.c
    src/model.c
    src/renderer.c
    src/world.c
)
target_link_libraries(2.5d_lighting PUBLIC SDL3::SDL3)
if(UNIX)
    target_link_libraries(2.5d_lighting PUBLIC m)
endif()
target_include_directories(2.5d_lighting PUBLIC lib/SPIRV-Reflect)
target_include_directories(2.5d_lighting PUBLIC lib/sqlite3)
target_include_directories(2.5d_lighting PUBLIC lib/stb)
target_include_directories(2.5d_lighting PUBLIC lib/tinyobjloader-c)
set_target_properties(2.5d_lighting PROPERTIES C_STANDARD 11)

function(spirv FILE)
    set(SOURCE shaders/${FILE})
    set(OUTPUT ${BINARY_DIR}/${FILE})
    add_custom_command(
        OUTPUT ${OUTPUT}
        COMMAND glslc ${SOURCE} -o ${OUTPUT} -I src
        WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
        DEPENDS ${SOURCE} src/config.h
        BYPRODUCTS ${OUTPUT}
        COMMENT ${SOURCE}
    )
    string(REPLACE . _ NAME ${FILE})
    add_custom_target(${NAME} DEPENDS ${OUTPUT})
    add_dependencies(2.5d_lighting ${NAME})
endfunction()
spirv(composite.frag)
spirv(fullscreen.vert)
spirv(fullscreen_flip.vert)
spirv(highlight.frag)
spirv(highlight.vert)
spirv(light.frag)
spirv(model.frag)
spirv(model.vert)
spirv(ray_model.frag)
spirv(sampler.comp)

function(model NAME)
    set(SOURCE models/${NAME}.mtl)
    set(OUTPUT ${BINARY_DIR}/${NAME}.mtl)
    configure_file(${SOURCE} ${OUTPUT} COPYONLY)
    set(SOURCE models/${NAME}.obj)
    set(OUTPUT ${BINARY_DIR}/${NAME}.obj)
    configure_file(${SOURCE} ${OUTPUT} COPYONLY)
    set(SOURCE models/${NAME}.png)
    set(OUTPUT ${BINARY_DIR}/${NAME}.png)
    configure_file(${SOURCE} ${OUTPUT} COPYONLY)
endfunction()
model(grass)
model(grass_blue)
model(grass_green)
model(grass_red)
model(rock1)
model(rock2)
model(rock3)
model(rock4)
model(rock5)
model(rock_blue)
model(rock_green)
model(rock_red)
model(tree1)
model(tree2)
model(tree3)

configure_file(LICENSE.txt ${BINARY_DIR} COPYONLY)
configure_file(README.md ${BINARY_DIR} COPYONLY)